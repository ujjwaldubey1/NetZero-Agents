import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography } from '@mui/material';

const ReportTable = ({ reports }) => (
  <Box sx={{ mt: 2, overflowX: 'auto' }}>
    <Table size="small" className="comic-table">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>PERIOD</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>STATUS</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>SCOPE 1</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>SCOPE 2</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>SCOPE 3</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((r) => (
          <TableRow key={r._id}>
            <TableCell>{r.period}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell>{r.scopeTotals?.scope1?.diesel_co2_tons?.toFixed?.(2) || '0.00'}</TableCell>
            <TableCell>{r.scopeTotals?.scope2?.electricity_co2_tons?.toFixed?.(2) || '0.00'}</TableCell>
            <TableCell>{r.scopeTotals?.scope3?.upstream_co2_tons?.toFixed?.(2) || '0.00'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    {reports.length === 0 && <Typography sx={{ p: 2 }}>No reports yet.</Typography>}
  </Box>
);

export default ReportTable;
