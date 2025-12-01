import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Chip } from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';

const VendorAnalysisTable = ({ vendors }) => {
  if (!vendors || vendors.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          No vendors analyzed yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" className="comic-table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>VENDOR</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>CURRENT Q</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>PREVIOUS Q</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>ANOMALIES</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>STATUS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vendors.map((vendor, idx) => {
            const anomalies = vendor.anomalies || [];
            const hasAnomalies = anomalies.length > 0;
            
            return (
              <TableRow key={vendor.email || vendor.name || idx}>
                <TableCell>
                  <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                    {vendor.name || vendor.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {vendor.scope3_comparison?.current_quarter || 'N/A'}
                </TableCell>
                <TableCell>
                  {vendor.scope3_comparison?.previous_quarter || 'N/A'}
                </TableCell>
                <TableCell>
                  {hasAnomalies ? (
                    <Chip
                      icon={<Warning />}
                      label={`${anomalies.length} ${anomalies.length === 1 ? 'Anomaly' : 'Anomalies'}`}
                      color="warning"
                      size="small"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        border: '2px solid #0a0a0a',
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<CheckCircle />}
                      label="None"
                      color="success"
                      size="small"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        border: '2px solid #0a0a0a',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vendor.status || 'pending'}
                    size="small"
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      bgcolor: vendor.status === 'attested' ? '#00f0ff' : '#fcee0a',
                      color: '#0a0a0a',
                      border: '2px solid #0a0a0a',
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default VendorAnalysisTable;


