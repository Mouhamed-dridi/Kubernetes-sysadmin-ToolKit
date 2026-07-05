import { useState } from 'react';
import {
  Container, Heading, Text, Box, Stack, Button,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { Trash2, Download, Moon, Sun } from 'lucide-react';
import { resetData, getPasswords } from '../api';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

export default function Settings() {
  const { logout } = useAuth();
  const { mode, setMode } = useTheme();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetting, setResetting] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleExport = async () => {
    try {
      const res = await getPasswords();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'passwords-export.json';
      a.click(); URL.revokeObjectURL(url);
      showMsg('success', 'Data exported');
    } catch { showMsg('error', 'Export failed'); }
  };

  const handleReset = async () => {
    setResetting(true);
    try { await resetData(); logout(); }
    catch { showMsg('error', 'Reset failed'); }
    finally { setResetting(false); }
  };

  return (
    <Container maxW="600px" py={8}>
      <Stack gap={8}>
        <Box><Heading size="lg" mb={2}>Settings</Heading><Text color="fg.muted">General preferences</Text></Box>

        {message.text && (
          <AlertRoot status={message.type}>
            <AlertIndicator /><AlertContent>
              <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Stack gap={4}>
            <Stack direction="row" align="center" gap={3}>
              {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <Box flex="1"><Heading size="sm">Theme</Heading><Text fontSize="sm" color="fg.muted">{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Text></Box>
              <Button variant={mode === 'dark' ? 'solid' : 'outline'} size="sm" px={2} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Stack gap={4}>
            <Stack direction="row" align="center" gap={3}>
              <Download size={20} /><Box><Heading size="sm">Export Data</Heading><Text fontSize="sm" color="fg.muted">Download all encrypted passwords as JSON</Text></Box>
            </Stack>
            <Button variant="outline" maxW="200px" onClick={handleExport}>Export as JSON</Button>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="red.300">
          <Stack gap={4}>
            <Stack direction="row" align="center" gap={3}>
              <Trash2 size={20} color="red" /><Box><Heading size="sm" color="red.500">Danger Zone</Heading><Text fontSize="sm" color="fg.muted">Delete all data and reset the application</Text></Box>
            </Stack>
            <Button colorScheme="red" variant="outline" maxW="250px" onClick={handleReset} disabled={resetting} loading={resetting}>Delete All Data</Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
