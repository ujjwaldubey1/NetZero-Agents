import React, { useEffect, useMemo, useState } from "react"
import {
	Box,
	Button,
	Grid,
	Typography,
	Stack,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Card,
	CardContent,
	Divider,
	Chip,
	CircularProgress,
	TextField,
} from "@mui/material"
import { Link } from "react-router-dom"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts"
import { motion, useSpring, useTransform } from "framer-motion"
import api, {
	analyzeEmissions,
	fetchDataCenters,
	getOrchestratorStatus,
	triggerInviteBot,
	triggerReminderBot,
} from "../../api"
import DashboardCards from "../../components/DashboardCards"
import MemeLayout from "../../components/MemeLayout"
import { ASSETS } from "../../assets"

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
	const spring = useSpring(0, { bounce: 0, duration: 2000 })
	const display = useTransform(spring, (current) => Math.round(current))

	useEffect(() => {
		spring.set(value)
	}, [value, spring])

	return <motion.span>{display}</motion.span>
}

const OperatorDashboard = () => {
	const [report, setReport] = useState(null)
	const [trend, setTrend] = useState([])
	const mockTotals = useMemo(
		() => ({
			scope1: { diesel_co2_tons: 342.75 },
			scope2: { electricity_co2_tons: 518.42 },
			scope3: { upstream_co2_tons: 387.63 },
		}),
		[]
	)
	const [error, setError] = useState(null)
	const [selectedPeriod, setSelectedPeriod] = useState(() => {
		const now = new Date()
		const year = now.getFullYear()
		const q = Math.ceil((now.getMonth() + 1) / 3)
		return `${year}-Q${q}`
	})
	const [datacenters, setDatacenters] = useState([])
	const [selectedDatacenter, setSelectedDatacenter] = useState("")
	const [orchLoading, setOrchLoading] = useState(false)
	const [orchError, setOrchError] = useState(null)
	const [orchResult, setOrchResult] = useState(null)
	const [orchStatus, setOrchStatus] = useState(null)
	const [liveLogs, setLiveLogs] = useState([])
	const [wsState, setWsState] = useState("idle")
	const mockTrend = useMemo(
		() => [
			{ period: "2025-Q1", scope1: 320, scope2: 450, scope3: 680 },
			{ period: "2025-Q2", scope1: 340, scope2: 470, scope3: 700 },
			{ period: "2025-Q3", scope1: 360, scope2: 490, scope3: 730 },
			{ period: "2025-Q4", scope1: 380, scope2: 510, scope3: 760 },
		],
		[]
	)

	const addLog = (entry) => {
		setLiveLogs((prev) => [
			...prev.slice(-29),
			{
				...entry,
				ts: entry.ts || new Date().toISOString(),
				payload: entry.payload || entry,
			},
		])
	}

	const load = async (periodOverride) => {
		try {
			const emissions = await api.get("/api/emissions/by-period")
			const map = {}
			emissions.data.forEach((r) => {
				map[r.period] = map[r.period] || {
					period: r.period,
					scope1: 0,
					scope2: 0,
					scope3: 0,
				}
				map[r.period][`scope${r.scope}`] +=
					r.extractedData?.[`scope${r.scope}`]?.diesel_co2_tons ||
					r.extractedData?.[`scope${r.scope}`]?.electricity_co2_tons ||
					r.extractedData?.[`scope${r.scope}`]?.upstream_co2_tons ||
					0
			})

			const periodsDesc = Object.values(map).sort((a, b) =>
				a.period > b.period ? -1 : 1
			)
			const periodToUse =
				periodOverride || periodsDesc[0]?.period || selectedPeriod

			// If we found a period in emissions and current selected isn't present, switch to it
			if (periodsDesc.length > 0 && !map[selectedPeriod]) {
				setSelectedPeriod(periodToUse)
			}

			// Trend chart sorted ascending for readability; if no data, leave empty and fallback to mock
			setTrend(periodsDesc.slice().reverse())

			// Prefer backend report for the chosen period; fall back to emissions aggregate
			let rep = null
			try {
				rep = await api.get("/api/reports/current", {
					params: { period: periodToUse },
				})
			} catch (err) {
				console.warn(
					"Report fetch failed, using emissions fallback",
					err.message
				)
			}

			if (rep?.data?.scopeTotals) {
				setReport(rep.data)
			} else {
				const fallback = map[periodToUse] || {
					scope1: 0,
					scope2: 0,
					scope3: 0,
					period: periodToUse,
				}
				setReport({
					scopeTotals: {
						scope1: { diesel_co2_tons: fallback.scope1 },
						scope2: { electricity_co2_tons: fallback.scope2 },
						scope3: { upstream_co2_tons: fallback.scope3 },
					},
					period: periodToUse,
					status: "draft",
				})
			}
		} catch (err) {
			setError(err.response?.data?.error || err.message)
		}
	}

	const loadMeta = async () => {
		try {
			const [dcRes, statusRes] = await Promise.all([
				fetchDataCenters(),
				getOrchestratorStatus().catch(() => ({ data: null })),
			])
			const dcList = dcRes.data?.data || dcRes.data || []
			setDatacenters(Array.isArray(dcList) ? dcList : [])
			if (Array.isArray(dcList) && dcList.length > 0) {
				setSelectedDatacenter((prev) => prev || dcList[0].name || dcList[0]._id)
			}
			setOrchStatus(statusRes.data || null)
		} catch (err) {
			console.error("Meta load failed", err)
		}
	}

	useEffect(() => {
		load()
	}, [selectedPeriod])

	useEffect(() => {
		loadMeta()
	}, [])

	useEffect(() => {
		const wsUrl =
			import.meta.env.VITE_WS_URL ||
			"ws://app.urbanservicecompany.live/ws/orchestrator"
		let socket
		try {
			socket = new WebSocket(wsUrl)
		} catch (err) {
			setWsState("error")
			addLog({ level: "warn", msg: `WebSocket init failed (${err.message})` })
			return undefined
		}

		setWsState("connecting")
		socket.onopen = () => setWsState("connected")
		socket.onclose = () => setWsState("closed")
		socket.onerror = () => setWsState("error")
		socket.onmessage = (evt) => {
			try {
				const parsed = JSON.parse(evt.data)
				addLog({
					level: parsed.level || parsed.type || "info",
					msg: parsed.message || parsed.msg || evt.data,
					ts: parsed.ts || parsed.timestamp || new Date().toISOString(),
					payload: parsed,
				})
			} catch {
				addLog({ level: "info", msg: evt.data, payload: { raw: evt.data } })
			}
		}

		return () => {
			socket && socket.close()
		}
	}, [])

	const triggerOrchestrator = async () => {
		if (!selectedDatacenter || !selectedPeriod) {
			setOrchError("Select a datacenter and period first.")
			return
		}
		setOrchLoading(true)
		setOrchError(null)
		setOrchResult(null)
		addLog({
			level: "info",
			msg: `Triggering orchestrator for ${selectedDatacenter} @ ${selectedPeriod}`,
		})
		try {
			const res = await analyzeEmissions(selectedDatacenter, selectedPeriod)
			setOrchResult({
				datacenter: selectedDatacenter,
				period: selectedPeriod,
				reportHash: res.data?.cryptographic_proofs?.report_hash,
				merkleRoot: res.data?.cryptographic_proofs?.evidence_merkle_root,
				timestamp: new Date().toISOString(),
			})
			addLog({
				level: "success",
				msg: `Orchestrator completed. Hash: ${
					res.data?.cryptographic_proofs?.report_hash?.substring(0, 10) || "n/a"
				}...`,
			})
			// Pull latest persisted report/trend from backend so cards and chart use stored data
			await load()
		} catch (err) {
			const msg =
				err.response?.data?.message || err.message || "Orchestrator failed"
			setOrchError(msg)
			addLog({ level: "error", msg })
		} finally {
			setOrchLoading(false)
		}
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
			},
		},
	}

	const itemVariants = {
		hidden: { y: 30, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15,
			},
		},
	}

	const cardHover = {
		scale: 1.02,
		boxShadow: "15px 15px 0px #0a0a0a",
		transition: { type: "spring", stiffness: 300, damping: 20 },
	}

	return (
		<MemeLayout
			bgPattern={`
        linear-gradient(135deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(225deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(315deg, #f5f5f5 25%, transparent 25%)
      `}
			bgSize="40px 40px"
			bgPosition="0 0, 0 0, 20px 20px, 20px 20px"
			sx={{ animation: "moveHorizontal 10s linear infinite" }}>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible">
				{/* Header Section */}
				<motion.div variants={itemVariants} style={{ marginBottom: "32px" }}>
					<motion.div
						whileHover={cardHover}
						style={{
							border: "3px solid #0a0a0a",
							padding: "24px",
							backgroundColor: "#ffffff",
							boxShadow: "10px 10px 0px #0a0a0a",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							gap: "16px",
							position: "relative",
							overflow: "visible",
							borderRadius: "4px",
						}}>
						<Box
							component="img"
							src={ASSETS.HOSKY_MEME}
							sx={{
								position: "absolute",
								top: -40,
								left: -20,
								width: 100,
								transform: "rotate(-10deg)",
								zIndex: 10,
								filter: "drop-shadow(5px 5px 0px rgba(0,0,0,0.2))",
								display: { xs: "none", md: "block" },
							}}
						/>
						<Box sx={{ ml: { xs: 0, md: 8 } }}>
							<Typography
								variant="h3"
								sx={{
									color: "#0a0a0a",
									transform: "rotate(-1deg)",
									textShadow: "3px 3px 0px #00f0ff",
									fontFamily: '"Bangers", sans-serif',
									letterSpacing: 2,
								}}>
								OPERATOR COMMAND
							</Typography>
							<Typography
								variant="body1"
								sx={{
									fontFamily: '"Space Grotesk", sans-serif',
									fontWeight: "bold",
									bgcolor: "#fcee0a",
									color: "#0a0a0a",
									display: "inline-block",
									px: 1,
									transform: "rotate(1deg)",
									border: "2px solid #0a0a0a",
								}}>
								MISSION: ZERO CARBON
							</Typography>
						</Box>
						<Stack direction="row" spacing={2} flexWrap="wrap">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<Button
									variant="contained"
									color="primary"
									onClick={async () => {
										if (!selectedDatacenter || !selectedPeriod)
											return alert("Select DC and Period first")
										addLog({ level: "info", msg: "Triggering Invite Bot..." })
										try {
											const res = await triggerInviteBot(
												selectedDatacenter,
												selectedPeriod
											)
											addLog({
												level: "success",
												msg: `Invite Bot: Sent ${res.data.result.sent} emails`,
											})
										} catch (e) {
											console.error(e)
											const errorMsg =
												e.response?.data?.error || e.message || "Unknown error"
											addLog({
												level: "error",
												msg: `Invite Bot failed: ${errorMsg}`,
											})
										}
									}}
									sx={{ fontWeight: "bold", border: "2px solid #0a0a0a" }}>
									Vendor Invite Bot
								</Button>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<Button
									variant="outlined"
									sx={{
										color: "#0a0a0a",
										borderColor: "#0a0a0a",
										fontWeight: "bold",
										border: "2px solid #0a0a0a",
										"&:hover": { bgcolor: "#fcee0a", borderColor: "#0a0a0a" },
									}}
									onClick={async () => {
										if (!selectedDatacenter || !selectedPeriod)
											return alert("Select DC and Period first")
										addLog({ level: "info", msg: "Triggering Reminder Bot..." })
										try {
											const res = await triggerReminderBot(
												selectedDatacenter,
												selectedPeriod
											)
											addLog({
												level: "success",
												msg: `Reminder Bot: Sent ${res.data.result.sent} reminders`,
											})
										} catch (e) {
											console.error(e)
											const errorMsg =
												e.response?.data?.error || e.message || "Unknown error"
											addLog({
												level: "error",
												msg: `Reminder Bot failed: ${errorMsg}`,
											})
										}
									}}>
									Report Checks Bot
								</Button>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<Button
									variant="contained"
									color="secondary"
									onClick={triggerOrchestrator}
									disabled={orchLoading}
									sx={{ fontWeight: "bold", border: "2px solid #0a0a0a" }}>
									{orchLoading ? (
										<CircularProgress size={18} color="inherit" />
									) : (
										"Run Orchestrator"
									)}
								</Button>
							</motion.div>
						</Stack>
					</motion.div>
				</motion.div>

				{/* Orchestrator control strip */}
				<Card
					sx={{
						mb: 4,
						border: "3px solid #0a0a0a",
						boxShadow: "10px 10px 0px #0a0a0a",
					}}>
					<CardContent>
						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={2}
							alignItems={{ xs: "stretch", md: "center" }}>
							<FormControl sx={{ minWidth: 200 }}>
								<InputLabel>Datacenter</InputLabel>
								<Select
									value={selectedDatacenter}
									label="Datacenter"
									onChange={(e) => setSelectedDatacenter(e.target.value)}>
									{datacenters.map((dc) => (
										<MenuItem key={dc._id || dc.name} value={dc.name || dc._id}>
											{dc.name || dc._id}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<TextField
								label="Year"
								type="number"
								value={selectedPeriod.split("-")[0]}
								onChange={(e) => {
									const newYear = e.target.value
									const currentQuarter = selectedPeriod.split("-")[1]
									setSelectedPeriod(`${newYear}-${currentQuarter}`)
								}}
								sx={{ width: 100 }}
								inputProps={{ min: 2020, max: 2030 }}
							/>
							<FormControl sx={{ minWidth: 120 }}>
								<InputLabel>Quarter</InputLabel>
								<Select
									value={selectedPeriod.split("-")[1]}
									label="Quarter"
									onChange={(e) => {
										const newQuarter = e.target.value
										const currentYear = selectedPeriod.split("-")[0]
										setSelectedPeriod(`${currentYear}-${newQuarter}`)
									}}>
									{["Q1", "Q2", "Q3", "Q4"].map((q) => (
										<MenuItem key={q} value={q}>
											{q}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<Stack direction="row" spacing={1} alignItems="center">
								<Chip
									label={orchStatus?.llm_provider || "LLM: n/a"}
									color={orchStatus?.llm_configured ? "success" : "default"}
								/>
								<Chip
									label={
										orchStatus?.masumi_blockchain?.enabled
											? "Masumi ON"
											: "Masumi OFF"
									}
									color={
										orchStatus?.masumi_blockchain?.enabled
											? "success"
											: "default"
									}
								/>
							</Stack>
							<Box flexGrow={1} />
							<Button
								variant="contained"
								color="secondary"
								onClick={triggerOrchestrator}
								disabled={orchLoading || !selectedDatacenter}
								sx={{
									fontWeight: "bold",
									border: "2px solid #0a0a0a",
									minWidth: 180,
								}}>
								{orchLoading ? (
									<CircularProgress size={18} color="inherit" />
								) : (
									"Trigger AI Agent"
								)}
							</Button>
						</Stack>
						<Typography
							variant="caption"
							sx={{
								mt: 1,
								display: "block",
								opacity: 0.8,
								fontFamily: '"Bangers", sans-serif',
								letterSpacing: 0.5,
							}}>
							PICK YOUR BASE + QUARTER (YYYY-Q#) THEN SMASH TRIGGER — COMMAND
							CENTER WILL HIT THE ORCHESTRATOR INSTANTLY.
						</Typography>
						{orchError && (
							<Alert severity="error" sx={{ mt: 2 }}>
								{orchError}
							</Alert>
						)}
						{orchResult && (
							<Alert severity="success" sx={{ mt: 2 }}>
								{orchResult.datacenter} @ {orchResult.period} → report hash{" "}
								{orchResult.reportHash || "n/a"}
							</Alert>
						)}
					</CardContent>
				</Card>

				{/* Live AI activity feed */}
				<Card
					sx={{
						mb: 4,
						border: "3px solid #0a0a0a",
						boxShadow: "10px 10px 0px #00f0ff",
					}}>
					<CardContent>
						<Stack
							direction={{ xs: "column", md: "row" }}
							alignItems={{ xs: "flex-start", md: "center" }}
							spacing={2}
							mb={2}>
							<Typography
								variant="h5"
								sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>
								LIVE AI AGENT ACTIVITY
							</Typography>
							<Chip
								label={`WebSocket: ${wsState}`}
								color={
									wsState === "connected"
										? "success"
										: wsState === "error"
										? "error"
										: "default"
								}
							/>
						</Stack>
						<Divider sx={{ mb: 2 }} />
						<Box
							sx={{
								maxHeight: 320,
								overflow: "auto",
								bgcolor: "#0a0a0a",
								color: "#00f0ff",
								p: 2,
								borderRadius: 1,
								border: "2px solid #00f0ff",
								fontFamily: "monospace",
								fontSize: "0.85rem",
							}}>
							{liveLogs.length === 0 && (
								<Typography variant="body2" sx={{ color: "#fcee0a" }}>
									Waiting for events... configure VITE_WS_URL to point to your
									orchestrator stream (e.g.,
									ws://localhost:4000/ws/orchestrator).
								</Typography>
							)}
							{liveLogs
								.slice()
								.reverse()
								.map((log, idx) => {
									const color =
										log.level === "error"
											? "#ff0055"
											: log.level === "success"
											? "#00f0ff"
											: "#ffffff"
									const meta = log.payload || {}
									return (
										<Box
											key={`${log.ts}-${idx}`}
											sx={{
												mb: 2,
												borderBottom: "1px solid rgba(255,255,255,0.1)",
												pb: 1,
											}}>
											<Box
												sx={{
													display: "flex",
													flexWrap: "wrap",
													gap: 1,
													alignItems: "center",
												}}>
												<Box component="span" sx={{ color: "#fcee0a" }}>
													[{new Date(log.ts).toLocaleTimeString()}]
												</Box>
												<Box component="span" sx={{ color, fontWeight: 700 }}>
													{(log.level || "INFO").toUpperCase()}
												</Box>
												{meta.stage && (
													<Box component="span" sx={{ color: "#fcee0a" }}>
														stage: {meta.stage}
													</Box>
												)}
												{meta.jobId && (
													<Box component="span" sx={{ color: "#fcee0a" }}>
														job: {meta.jobId}
													</Box>
												)}
												{meta.datacenter && (
													<Box component="span" sx={{ color: "#fcee0a" }}>
														dc: {meta.datacenter}
													</Box>
												)}
												{meta.period && (
													<Box component="span" sx={{ color: "#fcee0a" }}>
														period: {meta.period}
													</Box>
												)}
											</Box>
											<Box sx={{ mt: 0.5, color: "#fff" }}>{log.msg}</Box>
											{(meta.reportHash ||
												meta.merkleRoot ||
												meta.evidenceCount !== undefined ||
												meta.masumiTransactions !== undefined) && (
												<Box sx={{ mt: 0.5, color: "#00f0ff" }}>
													{meta.reportHash && (
														<div>reportHash: {meta.reportHash}</div>
													)}
													{meta.merkleRoot && (
														<div>merkleRoot: {meta.merkleRoot}</div>
													)}
													{meta.evidenceCount !== undefined && (
														<div>evidenceCount: {meta.evidenceCount}</div>
													)}
													{meta.masumiTransactions !== undefined && (
														<div>masumiTx: {meta.masumiTransactions}</div>
													)}
												</Box>
											)}
											{meta && Object.keys(meta).length > 0 && (
												<Box
													sx={{
														mt: 0.5,
														bgcolor: "#111",
														p: 1,
														borderRadius: 1,
														border: "1px solid rgba(0,240,255,0.3)",
														color: "#9be7ff",
													}}>
													{JSON.stringify(meta, null, 2)}
												</Box>
											)}
										</Box>
									)
								})}
						</Box>
					</CardContent>
				</Card>

				{error && (
					<Alert
						severity="error"
						sx={{
							mt: 2,
							border: "3px solid #0a0a0a",
							boxShadow: "5px 5px 0px #0a0a0a",
						}}>
						{error}
					</Alert>
				)}

				<motion.div variants={itemVariants}>
					<DashboardCards
						totals={
							report &&
							report.scopeTotals &&
							(report.scopeTotals.scope1?.diesel_co2_tons ||
								report.scopeTotals.scope2?.electricity_co2_tons ||
								report.scopeTotals.scope3?.upstream_co2_tons)
								? report.scopeTotals
								: mockTotals
						}
					/>
				</motion.div>

				<Grid container spacing={4} sx={{ mt: 2 }}>
					{/* Chart Section */}
					<Grid item xs={12} md={8}>
						<motion.div variants={itemVariants} style={{ height: "100%" }}>
							<motion.div
								whileHover={cardHover}
								style={{
									height: "100%",
									border: "3px solid #0a0a0a",
									backgroundColor: "#ffffff",
									padding: "24px",
									boxShadow: "10px 10px 0px #0a0a0a",
									position: "relative",
									overflow: "visible",
									borderRadius: "4px",
								}}>
								<Box
									component="img"
									src={ASSETS.VILLAIN_BUG}
									sx={{
										position: "absolute",
										top: -30,
										right: -10,
										width: 80,
										transform: "rotate(15deg)",
										zIndex: 10,
										filter: "drop-shadow(5px 5px 0px rgba(0,0,0,0.2))",
									}}
								/>
								<Typography
									variant="h5"
									gutterBottom
									sx={{
										borderBottom: "3px solid #fcee0a",
										display: "inline-block",
										mb: 2,
										color: "#0a0a0a",
										fontFamily: '"Bangers", sans-serif',
										letterSpacing: 1,
									}}>
									EMISSIONS TREND
								</Typography>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={trend.length ? trend : mockTrend}>
										<CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
										<XAxis
											dataKey="period"
											stroke="#0a0a0a"
											tick={{ fontFamily: "Space Grotesk" }}
										/>
										<YAxis
											stroke="#0a0a0a"
											tick={{ fontFamily: "Space Grotesk" }}
										/>
										<Tooltip
											contentStyle={{
												border: "3px solid #0a0a0a",
												borderRadius: 0,
												boxShadow: "5px 5px 0px #0a0a0a",
												backgroundColor: "#ffffff",
												color: "#0a0a0a",
											}}
											itemStyle={{
												fontFamily: "Space Grotesk",
												fontWeight: "bold",
											}}
										/>
										<Line
											type="monotone"
											dataKey="scope1"
											stroke="#00f0ff"
											strokeWidth={4}
											activeDot={{ r: 8, strokeWidth: 2, stroke: "#0a0a0a" }}
										/>
										<Line
											type="monotone"
											dataKey="scope2"
											stroke="#ff0055"
											strokeWidth={4}
											activeDot={{ r: 8, strokeWidth: 2, stroke: "#0a0a0a" }}
										/>
										<Line
											type="monotone"
											dataKey="scope3"
											stroke="#fcee0a"
											strokeWidth={4}
											activeDot={{ r: 8, strokeWidth: 2, stroke: "#0a0a0a" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</motion.div>
						</motion.div>
					</Grid>

					{/* Status Section (now mirrors WebSocket state instead of static report status) */}
					<Grid item xs={12} md={4}>
						<motion.div variants={itemVariants} style={{ height: "100%" }}>
							<motion.div
								whileHover={{
									...cardHover,
									boxShadow: "15px 15px 0px #00f0ff",
								}}
								style={{
									height: "100%",
									border: "3px solid #0a0a0a",
									backgroundColor: "#0a0a0a",
									color: "#fff",
									padding: "24px",
									boxShadow: "10px 10px 0px #00f0ff",
									borderRadius: "4px",
								}}>
								<Typography
									variant="h5"
									gutterBottom
									sx={{
										color: "#fff",
										textShadow: "2px 2px 0px #ff0055",
										fontFamily: '"Bangers", sans-serif',
										letterSpacing: 1,
									}}>
									LIVE FEED SNAPSHOT
								</Typography>
								<Box
									sx={{
										fontFamily: '"Space Grotesk", sans-serif',
										fontSize: "1rem",
										lineHeight: 1.8,
									}}>
									<Box
										display="flex"
										justifyContent="space-between"
										borderBottom="1px dashed #333"
										py={1}>
										<span>WS STATE:</span>
										<span
											style={{
												color: wsState === "connected" ? "#00f0ff" : "#fcee0a",
												fontWeight: "bold",
											}}>
											{wsState.toUpperCase()}
										</span>
									</Box>
									<Box
										display="flex"
										justifyContent="space-between"
										borderBottom="1px dashed #333"
										py={1}>
										<span>LAST EVENT:</span>
										<span
											style={{
												color: "#fcee0a",
												maxWidth: "50%",
												textAlign: "right",
											}}>
											{liveLogs.length
												? liveLogs[liveLogs.length - 1].msg
												: "Waiting for stream..."}
										</span>
									</Box>
									<Box
										display="flex"
										justifyContent="space-between"
										borderBottom="1px dashed #333"
										py={1}>
										<span>STREAM:</span>
										<span style={{ color: "#fff" }}>
											{import.meta.env.VITE_WS_URL ||
												"ws://localhost:4000/ws/orchestrator"}
										</span>
									</Box>
								</Box>
								<Alert
									severity="info"
									sx={{
										mt: 3,
										bgcolor: "#0a0a0a",
										color: "#fcee0a",
										border: "1px solid #fcee0a",
									}}>
									Freezing is default; use the live WebSocket feed to track
									agent progress in real time.
								</Alert>
							</motion.div>
						</motion.div>
					</Grid>
				</Grid>
			</motion.div>
		</MemeLayout>
	)
}

export default OperatorDashboard
