import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Heading, Text, Box, Stack, TableRoot, TableBody,
  TableRow, TableCell, TableHeader, TableColumnHeader, Spinner, Center,
  IconButton, Input, Flex, FieldRoot, FieldLabel, EmptyStateRoot,
  EmptyStateContent, EmptyStateIndicator, EmptyStateTitle, EmptyStateDescription,
  Button, SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@chakra-ui/react';
import { Lock, LockKeyhole, Upload, KeyRound, Users, Cloud, ChevronLeft, Trash2 } from 'lucide-react';
import { createListCollection } from '@ark-ui/react';
import { decryptField, getUsers, deleteUser, getConfig, updateConfig, getPasswords, changePassword } from '../api';
import { usePasswords } from '../PasswordsContext';
import { useAuth } from '../AuthContext';
import { useLang } from '../LangContext';

const ALGO_ITEMS = [
  { value: 'aes-256-cbc', label: 'AES-256-CBC' },
  { value: 'aes-192-cbc', label: 'AES-192-CBC' },
  { value: 'aes-128-cbc', label: 'AES-128-CBC' },
  { value: 'aes-256-gcm', label: 'AES-256-GCM' },
  { value: 'aes-128-gcm', label: 'AES-128-GCM' },
  { value: 'aes-192-gcm', label: 'AES-192-GCM' },
];
const algoCollection = createListCollection({ items: ALGO_ITEMS });

const adminCards = [
  { id: 'hash', icon: KeyRound, labelKey: 'settings.encryption', descKey: 'settings.encryptionDesc' },
  { id: 'users', icon: Users, labelKey: 'settings.users', descKey: 'settings.usersDesc' },
  { id: 'backup', icon: Cloud, labelKey: 'settings.export', descKey: 'settings.exportDesc' },
  { id: 'password', icon: Lock, labelKey: 'profile.changePassword', descKey: 'profile.subtitle' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const { passwords, refreshPasswords, loading } = usePasswords();
  const [unlocked, setUnlocked] = useState({});
  const [decrypted, setDecrypted] = useState({});
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [encAlgo, setEncAlgo] = useState('aes-256-cbc');
  const [algoLoading, setAlgoLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    refreshPasswords();
  }, []);

  useEffect(() => {
    if (user?.is_admin) {
      setUsersLoading(true);
      getUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setUsersLoading(false));
      getConfig().then(r => { if (r.data.encryption_algo) setEncAlgo(r.data.encryption_algo); }).catch(() => {});
    }
  }, [user?.is_admin]);

  // --- Admin functions ---
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

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) return showMsg('error', 'Fill all fields');
    if (newPass !== confirmPass) return showMsg('error', 'Passwords do not match');
    if (newPass.length < 4) return showMsg('error', 'Password must be at least 4 characters');
    setPassSaving(true);
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      showMsg('success', 'Password changed');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Change failed');
    }
    setPassSaving(false);
  };

  // --- User vault functions ---
  const toggleRow = async (id) => {
    if (unlocked[id]) {
      setUnlocked((prev) => ({ ...prev, [id]: false }));
      return;
    }
    const item = passwords.find((p) => p.id === id);
    if (!item) return;
    try {
      const [urlRes, loginRes, passRes] = await Promise.all([
        item.url ? decryptField(item.url) : { data: { decrypted: null } },
        decryptField(item.encrypted_login),
        decryptField(item.encrypted_password),
      ]);
      const hashVal = (enc) => enc && enc.startsWith('hash:') ? '🞄🞄🞄🞄🞄🞄🞄🞄' : null;
      setDecrypted((prev) => ({
        ...prev,
        [id]: {
          url: urlRes.data.hashMode ? hashVal(item.url) : urlRes.data.decrypted,
          login: loginRes.data.hashMode ? hashVal(item.encrypted_login) : loginRes.data.decrypted,
          pass: passRes.data.hashMode ? hashVal(item.encrypted_password) : passRes.data.decrypted,
          hashMode: urlRes.data.hashMode || loginRes.data.hashMode || passRes.data.hashMode,
        },
      }));
      setUnlocked((prev) => ({ ...prev, [id]: true }));
    } catch {}
  };

  const hashDisplay = (enc) => {
    if (!enc) return '—';
    if (enc.startsWith('hash:')) return '🔒';
    const hex = enc.includes(':') ? enc.split(':')[1] : enc;
    return hex.slice(0, 12).toUpperCase();
  };

  const filtered = passwords.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) ||
           (p.encrypted_login && p.encrypted_login.toLowerCase().includes(q));
  });

  // --- Admin dashboard (cards) ---
  if (user?.is_admin && !activeCard) {
    return (
      <Container maxW="800px" py={10}>
        <Stack gap={8}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>Administration</Heading>
            <Text color="fg.muted">Manage the password manager</Text>
          </Box>

          {message.text && (
            <AlertRoot status={message.type}>
              <AlertIndicator /><AlertContent>
                <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}

          <Flex gap={6} wrap="wrap" justify="center">
            {adminCards.map(card => {
              const Icon = card.icon;
              return (
                <Box
                  key={card.id}
                  w="220px"
                  p={6}
                  borderWidth="1px"
                  borderRadius="xl"
                  cursor="pointer"
                  _hover={{ bg: 'bg.emphasized', borderColor: 'blue.400', transform: 'translateY(-4px)' }}
                  transition="0.2s"
                  boxShadow="sm"
                  onClick={() => setActiveCard(card.id)}
                >
                  <Stack gap={4} align="center" textAlign="center">
                    <Box p={4} bg="blue.500" color="white" borderRadius="xl">
                      <Icon size={28} />
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" fontSize="lg">{t(card.labelKey)}</Text>
                      <Text fontSize="sm" color="fg.muted" mt={1}>{t(card.descKey)}</Text>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Flex>
        </Stack>
      </Container>
    );
  }

  // --- Admin card detail views ---
  if (user?.is_admin && activeCard === 'hash') {
    return (
      <Container maxW="600px" py={10}>
        <Stack gap={6}>
          <Flex align="center" gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setActiveCard(null)} px={1}><ChevronLeft size={20} /></Button>
            <KeyRound size={24} /><Heading size="lg">{t('settings.encryption')}</Heading>
          </Flex>
          {message.text && (
            <AlertRoot status={message.type}>
              <AlertIndicator /><AlertContent>
                <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Text fontSize="sm" color="fg.muted" mb={4}>{t('settings.encryptionDesc')}</Text>
            <SelectRoot collection={algoCollection} value={[encAlgo]} onValueChange={({ value }) => handleAlgoChange(value[0])} disabled={algoLoading}>
              <SelectTrigger><SelectValueText /></SelectTrigger>
              <SelectContent>
                {ALGO_ITEMS.map(item => (
                  <SelectItem key={item.value} item={item}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (user?.is_admin && activeCard === 'users') {
    return (
      <Container maxW="800px" py={10}>
        <Stack gap={6}>
          <Flex align="center" gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setActiveCard(null)} px={1}><ChevronLeft size={20} /></Button>
            <Users size={24} /><Heading size="lg">{t('settings.users')}</Heading>
          </Flex>
          {message.text && (
            <AlertRoot status={message.type}>
              <AlertIndicator /><AlertContent>
                <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Text fontSize="sm" color="fg.muted" mb={4}>{t('settings.usersDesc')}</Text>
            {usersLoading ? (
              <Text fontSize="sm" color="fg.muted">{t('settings.loadingUsers')}</Text>
            ) : users.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">{t('settings.noUsers')}</Text>
            ) : (
              <Flex wrap="wrap" gap={4}>
                {users.map(u => (
                  <Box key={u.id} p={4} borderWidth="1px" borderRadius="lg" w="180px" textAlign="center">
                    <Flex bg="blue.500" color="white" borderRadius="full" w="40px" h="40px" align="center" justify="center" fontSize="lg" fontWeight="bold" mx="auto" mb={2}>
                      {u.username.charAt(0).toUpperCase()}
                    </Flex>
                    <Text fontWeight={u.is_admin ? 'bold' : 'medium'} fontSize="sm">{u.username}{u.is_admin ? ` (${t('admin.label')})` : ''}</Text>
                    <Text fontSize="xs" color="fg.muted" mb={2}>{u.password_count} {t('passwords.count')}</Text>
                    <Button variant="ghost" size="xs" color="red" disabled={u.is_admin} onClick={() => setDeleteTarget(u)}>
                      <Trash2 size={16} />
                    </Button>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Stack>

        <DialogRoot open={!!deleteTarget} onOpenChange={({ open }) => !open && setDeleteTarget(null)}>
          <DialogBackdrop />
          <DialogContent>
            <DialogHeader><DialogTitle>{t('dialog.deleteUser')}</DialogTitle></DialogHeader>
            <DialogDescription>{t('dialog.deleteUserMsg', { username: deleteTarget?.username })}</DialogDescription>
            <DialogFooter gap={2}>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('dialog.cancel')}</Button>
              <Button colorScheme="red" onClick={handleDeleteUser}>{t('dialog.delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Container>
    );
  }

  if (user?.is_admin && activeCard === 'backup') {
    return (
      <Container maxW="600px" py={10}>
        <Stack gap={6}>
          <Flex align="center" gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setActiveCard(null)} px={1}><ChevronLeft size={20} /></Button>
            <Cloud size={24} /><Heading size="lg">{t('settings.export')}</Heading>
          </Flex>
          {message.text && (
            <AlertRoot status={message.type}>
              <AlertIndicator /><AlertContent>
                <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Text fontSize="sm" color="fg.muted" mb={4}>{t('settings.exportDesc')}</Text>
            <Button variant="outline" maxW="200px" onClick={handleExport}>{t('settings.exportBtn')}</Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (user?.is_admin && activeCard === 'password') {
    return (
      <Container maxW="600px" py={10}>
        <Stack gap={6}>
          <Flex align="center" gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setActiveCard(null)} px={1}><ChevronLeft size={20} /></Button>
            <Lock size={24} /><Heading size="lg">{t('profile.changePassword')}</Heading>
          </Flex>
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
              <FieldRoot><FieldLabel>{t('profile.currentPass')}</FieldLabel><Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} /></FieldRoot>
              <FieldRoot><FieldLabel>{t('profile.newPass')}</FieldLabel><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></FieldRoot>
              <FieldRoot><FieldLabel>{t('profile.confirmPass')}</FieldLabel><Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} /></FieldRoot>
              <Button variant="outline" maxW="200px" onClick={handleChangePassword} disabled={passSaving} loading={passSaving}>{t('profile.changePassBtn')}</Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    );
  }

  // --- User vault (non-admin) ---
  if (loading && passwords.length === 0) {
    return <Center minH="60vh"><Spinner size="xl" /></Center>;
  }

  if (passwords.length === 0) {
    return (
      <Center minH="60vh">
        <EmptyStateRoot>
          <EmptyStateContent>
            <EmptyStateIndicator>
              <Lock size={48} />
            </EmptyStateIndicator>
            <EmptyStateTitle>No passwords yet</EmptyStateTitle>
            <EmptyStateDescription>
              Upload a CSV file to get started
            </EmptyStateDescription>
            <IconButton
              colorScheme="blue"
              mt={4}
              onClick={() => navigate('/upload')}
            >
              <Upload size={20} />
              Upload CSV
            </IconButton>
          </EmptyStateContent>
        </EmptyStateRoot>
      </Center>
    );
  }

  return (
    <Container maxW="1000px" py={8}>
      <Stack gap={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Password Vault</Heading>
            <Text color="fg.muted">{passwords.length} entries stored</Text>
          </Box>
          <FieldRoot maxW="300px" w="full">
            <FieldLabel srOnly>Search</FieldLabel>
            <Input
              placeholder="Search by title or login..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FieldRoot>
        </Flex>

        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableColumnHeader>Name</TableColumnHeader>
                <TableColumnHeader>URL</TableColumnHeader>
                <TableColumnHeader>Login</TableColumnHeader>
                <TableColumnHeader>Password</TableColumnHeader>
                <TableColumnHeader w="80px">Lock</TableColumnHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const open = unlocked[item.id];
                const data = decrypted[item.id];
                return (
                  <TableRow key={item.id}>
                    <TableCell fontWeight="medium">{item.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <Text fontFamily="mono" fontSize="xs" color={open ? 'inherit' : 'fg.muted'} maxW="200px" truncate>
                        {open && data ? data.url : (item.url ? hashDisplay(item.url) : '—')}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text fontFamily="mono" fontSize="xs" color={open ? 'inherit' : 'fg.muted'}>
                        {open && data ? data.login : hashDisplay(item.encrypted_login)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text fontFamily="mono" fontSize="xs" color={open ? 'inherit' : 'fg.muted'}>
                        {open && data ? data.pass : hashDisplay(item.encrypted_password)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        variant="ghost"
                        size="xs"
                        onClick={() => toggleRow(item.id)}
                      >
                        {open ? <LockKeyhole size={16} /> : <Lock size={16} />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableRoot>
        </Box>
      </Stack>
    </Container>
  );
}
