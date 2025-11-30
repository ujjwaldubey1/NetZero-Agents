import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

const ReportTable = ({ tableRows, onView }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'MINTED':
        return 'success';
      case 'FROZEN':
        return 'info';
      case 'ANALYZED':
        return 'warning';
      case 'PENDING':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" className="comic-table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              PERIOD
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              STATUS
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              SCOPE 1 (tCO2e)
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              SCOPE 2 (tCO2e)
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              SCOPE 3 (tCO2e)
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((row, index) => (
            <TableRow key={row.period || index} hover>
              <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {row.period}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.status || 'PENDING'}
                  color={getStatusColor(row.status)}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {row.scope1 || '0.00'}
              </TableCell>
              <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {row.scope2 || '0.00'}
              </TableCell>
              <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {row.scope3 || '0.00'}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => onView && onView(row.period)}
                  sx={{
                    borderColor: '#0a0a0a',
                    color: '#0a0a0a',
                    fontFamily: '"Space Grotesk", sans-serif',
                    '&:hover': {
                      bgcolor: '#00f0ff',
                      borderColor: '#0a0a0a',
                    },
                  }}
                >
                  VIEW
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {tableRows.length === 0 && (
        <Typography sx={{ p: 2, fontFamily: '"Space Grotesk", sans-serif' }}>
          No reports yet.
        </Typography>
      )}
    </Box>
  );
};

export default ReportTable;
