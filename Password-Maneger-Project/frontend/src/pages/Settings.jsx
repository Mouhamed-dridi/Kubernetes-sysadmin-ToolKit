import { useState, useEffect } from 'react';
import {
  Container, Heading, Text, Box, Stack, Button, SelectRoot, SelectTrigger,
  SelectValueText, SelectContent, SelectItem,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
  TableRoot, TableBody, TableRow, TableCell,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@chakra-ui/react';
import { Trash2, Download, Moon, Sun, ShieldAlert, KeyRound } from 'lucide-react';
import { createListCollection } from '@ark-ui/react';
import { resetData, getPasswords, getUsers, deleteUser, getConfig, updateConfig } from '../api';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const ALGO_ITEMS = [
  { value: 'aes-256-cbc', label: 'AES-256-CBC' },
  { value: 'aes-192-cbc', label: 'AES-192-CBC' },
  { value: 'aes-128-cbc', label: 'AES-128-CBC' },
  { value: 'aes-256-gcm', label: 'AES-256-GCM' },
  { value: 'aes-128-gcm', label: 'AES-128-GCM' },
  { value: 'aes-192-gcm', label: 'AES-192-GCM' },
];

const algoCollection = createListCollection({ items: ALGO_ITEMS });

export default function Settings() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetting, setResetting] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [encAlgo, setEncAlgo] = useState('aes-256-cbc');
  const [algoLoading, setAlgoLoading] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    if (user?.is_admin) {
      setUsersLoading(true);
      getUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setUsersLoading(false));
      getConfig().then(r => { if (r.data.encryption_algo) setEncAlgo(r.data.encryption_algo); }).catch(() => {});
    }
  }, [user?.is_admin]);

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

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      showMsg('success', `User "${deleteTarget.username}" deleted`);
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Delete failed');
    }
    setDeleteTarget(null);
  };

  const handleAlgoChange = async (value) => {
    setAlgoLoading(true);
    try {
      await updateConfig('encryption_algo', value);
      setEncAlgo(value);
      const label = ALGO_ITEMS.find(i => i.value === value)?.label || value;
      showMsg('success', `Encryption algorithm changed to ${label}`);
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to update');
    }
    setAlgoLoading(false);
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

        {user?.is_admin && (
          <>
            <Box p={6} borderWidth="1px" borderRadius="lg">
              <Stack gap={4}>
                <Stack direction="row" align="center" gap={3}>
                  <KeyRound size={20} /><Box><Heading size="sm">Encryption Algorithm</Heading><Text fontSize="sm" color="fg.muted">Change the cipher used for encrypting passwords</Text></Box>
                </Stack>
                <SelectRoot collection={algoCollection} value={[encAlgo]} onValueChange={({ value }) => handleAlgoChange(value[0])} disabled={algoLoading}>
                  <SelectTrigger><SelectValueText /></SelectTrigger>
                  <SelectContent>
                    {ALGO_ITEMS.map(item => (
                      <SelectItem key={item.value} item={item}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Stack>
            </Box>

            <Box p={6} borderWidth="1px" borderRadius="lg">
              <Stack gap={4}>
                <Stack direction="row" align="center" gap={3}>
                  <ShieldAlert size={20} /><Box><Heading size="sm">User Management</Heading><Text fontSize="sm" color="fg.muted">View and manage all registered users</Text></Box>
                </Stack>
                {usersLoading ? (
                  <Text fontSize="sm" color="fg.muted">Loading users...</Text>
                ) : (
                  <TableRoot>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell fontWeight={u.is_admin ? 'bold' : 'normal'}>{u.username}{u.is_admin ? ' (Admin)' : ''}</TableCell>
                          <TableCell fontSize="sm" color="fg.muted">{u.password_count} passwords</TableCell>
                          <TableCell textAlign="right">
                            <Button variant="ghost" size="xs" color="red" disabled={u.is_admin} onClick={() => setDeleteTarget(u)}>
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                )}
              </Stack>
            </Box>
          </>
        )}

        <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="red.300">
          <Stack gap={4}>
            <Stack direction="row" align="center" gap={3}>
              <Trash2 size={20} color="red" /><Box><Heading size="sm" color="red.500">Danger Zone</Heading><Text fontSize="sm" color="fg.muted">Delete all data and reset the application</Text></Box>
            </Stack>
            <Button colorScheme="red" variant="outline" maxW="250px" onClick={handleReset} disabled={resetting} loading={resetting}>Delete All Data</Button>
          </Stack>
        </Box>
      </Stack>

      <DialogRoot open={!!deleteTarget} onOpenChange={({ open }) => !open && setDeleteTarget(null)}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <DialogDescription>
            Are you sure you want to delete <strong>{deleteTarget?.username}</strong>? All their passwords will be permanently removed.
          </DialogDescription>
          <DialogFooter gap={2}>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  );
}
