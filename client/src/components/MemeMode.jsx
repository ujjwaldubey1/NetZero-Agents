import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Switch, Stack, Button, Chip } from '@mui/material';
import api from '../api';

const memes = ['/memes/meme1.png', '/memes/meme2.png', '/memes/meme3.png'];

const MemeMode = () => {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [caption, setCaption] = useState('Cardano green memes ready.');

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % memes.length), 3500);
    return () => clearInterval(id);
  }, [enabled]);

  const refreshCaption = async () => {
    const res = await api.post('/api/ai/meme-caption', { theme: 'clean data centers' });
    setCaption(res.data.caption || 'Eco-magic on-chain.');
  };

  return (
    <Card className="glass-card" sx={{ mt: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={700}>Cardano Meme Mode</Typography>
          <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <Chip label="Just for fun" size="small" />
          {enabled && <Button size="small" variant="outlined" onClick={refreshCaption}>Refresh caption</Button>}
        </Stack>
        {enabled && (
          <Box display="flex" alignItems="center" gap={3} mt={2}>
            <img src={memes[index]} alt="meme" width={220} className="meme-img" />
            <Typography variant="subtitle1">{caption}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MemeMode;
