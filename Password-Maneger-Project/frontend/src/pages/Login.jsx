import { useState, useEffect } from 'react';
import {
  Center, Box, Heading, Text, Input, Button, FieldRoot, FieldLabel,
  Stack, AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
  InputGroup, DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogActionTrigger
} from '@chakra-ui/react';
import { Lock, Shield, UserPlus, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLang } from '../LangContext';
import { getUserCount } from '../api';

export default function Login() {
  const { loginUser, register } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getUserCount().then(r => {
      if (r.data.count === 0) setUsername('admin');
    }).catch(() => {}).finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(username, password);
      } else {
        if (password !== confirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('Password must be at least 4 characters');
          setLoading(false);
          return;
        }
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await register(username, password);
        setCreatedUser(username);
        setUsername('');
        setPassword('');
        setConfirm('');
        setMode('login');
        setSuccessOpen(true);
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running on port 3001.');
      } else {
        setError(err.response?.data?.error || err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" p={4}>
      <Box w="full" maxW="400px">
        <Stack align="center" mb={8}>
          <Box bg="blue.500" color="white" p={3} borderRadius="2xl">
            <Lock size={32} />
          </Box>
          <Heading size="xl">{t('app.name')}</Heading>
          <Text color="fg.muted" textAlign="center">
            {checking ? t('app.loading') : (mode === 'login' ? t('login.title') : t('login.subtitle'))}
          </Text>
        </Stack>

        {error && (
          <AlertRoot status="error" mb={4}>
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        <Box as="form" onSubmit={handleSubmit}>
          <Stack gap={4}>
            <FieldRoot>
              <FieldLabel>{t('login.username')}</FieldLabel>
              <Input
                placeholder={t('login.enterUser')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </FieldRoot>

            <FieldRoot>
              <FieldLabel>{t('login.password')}</FieldLabel>
              <InputGroup endElement={
                <Button variant="ghost" size="xs" onClick={() => setShowPass(!showPass)} px={1} minW="auto">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              }>
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('login.enterPass')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </FieldRoot>

            {mode === 'register' && (
              <FieldRoot>
                <FieldLabel>{t('login.confirm')}</FieldLabel>
                <InputGroup endElement={
                  <Button variant="ghost" size="xs" onClick={() => setShowConfirm(!showConfirm)} px={1} minW="auto">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                }>
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t('login.enterConfirm')}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </InputGroup>
              </FieldRoot>
            )}

            <Button type="submit" colorScheme="blue" size="lg" disabled={loading || checking} loading={loading}>
              {mode === 'login' ? t('login.signin') : t('login.create')}
            </Button>
          </Stack>
        </Box>

        <Stack align="center" mt={6} gap={2}>
          <Button variant="link" size="sm" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? (
              <><UserPlus size={14} style={{ marginRight: 4 }} /> {t('login.createLink')}</>
            ) : (
              t('login.existingLink')
            )}
          </Button>
          <Text fontSize="xs" color="fg.muted">
            <Shield size={12} style={{ display: 'inline', marginRight: 4 }} />
            {t('login.encrypted')}
          </Text>
        </Stack>
      </Box>

      <DialogRoot open={successOpen} onOpenChange={({ open }) => setSuccessOpen(open)}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle display="flex" alignItems="center" gap={2}>
              <CheckCircle size={20} color="green" />
              {t('dialog.accountCreated')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {t('dialog.createdMsg', { username: createdUser })}
          </DialogDescription>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button colorScheme="blue">{t('dialog.signIn')}</Button>
            </DialogActionTrigger>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Center>
  );
}
