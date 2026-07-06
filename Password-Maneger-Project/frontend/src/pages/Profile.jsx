import { useState, useRef } from 'react';
import {
  Container, Heading, Text, Box, Stack, Button, Input, FieldRoot, FieldLabel, Flex,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
  AvatarRoot, AvatarFallback, AvatarImage, Separator
} from '@chakra-ui/react';
import { Camera, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword, uploadAvatar } from '../api';
import { useAuth } from '../AuthContext';
import { useLang } from '../LangContext';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [username, setUsername] = useState(user?.username || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) return showMsg('error', 'Username required');
    setSaving(true);
    try {
      await updateProfile(username);
      showMsg('success', t('profile.updateSuccess'));
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) return showMsg('error', 'Fill all fields');
    if (newPass !== confirmPass) return showMsg('error', t('login.error.match'));
    if (newPass.length < 4) return showMsg('error', t('login.error.length'));
    setSaving(true);
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      showMsg('success', t('profile.passwordChanged'));
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Change failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await uploadAvatar(reader.result);
        showMsg('success', t('profile.avatarUpdated'));
      } catch {
        showMsg('error', 'Avatar upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Container maxW="500px" py={8}>
      <Stack gap={6}>
        <Flex align="center" gap={3}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} px={1}>
            <ArrowLeft size={20} />
          </Button>
          <Box>
            <Heading size="lg">{t('profile.title')}</Heading>
            <Text color="fg.muted">{t('profile.subtitle')}</Text>
          </Box>
        </Flex>

        {message.text && (
          <AlertRoot status={message.type}>
            <AlertIndicator /><AlertContent>
              <AlertTitle>{message.type === 'success' ? t('success') : t('error')}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Stack gap={4} align="center">
            <Box position="relative" onClick={() => fileRef.current?.click()} cursor="pointer" boxSize="80px">
              <AvatarRoot boxSize="80px" fontSize="2xl">
                <AvatarFallback name={user?.username} />
                <AvatarImage src={user?.avatar} />
              </AvatarRoot>
              <Flex position="absolute" inset="0" bg="blackAlpha.500" borderRadius="full" align="center" justify="center" opacity="0" _hover={{ opacity: 1 }} transition="0.2s">
                <Camera size={24} color="white" />
              </Flex>
            </Box>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
            <Text fontSize="sm" color="fg.muted" mt={-2}>{t('profile.changePhoto')}</Text>
          </Stack>
          <Separator my={4} />
          <Stack gap={4}>
            <FieldRoot>
              <FieldLabel>{t('login.username')}</FieldLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FieldRoot>
            <Button variant="outline" onClick={handleUpdateProfile} disabled={saving} loading={saving} maxW="120px">{t('profile.save')}</Button>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}><Lock size={18} /> {t('profile.changePassword')}</Heading>
          <Stack gap={4}>
            <FieldRoot><FieldLabel>{t('profile.currentPass')}</FieldLabel><Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} /></FieldRoot>
            <FieldRoot><FieldLabel>{t('profile.newPass')}</FieldLabel><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></FieldRoot>
            <FieldRoot><FieldLabel>{t('profile.confirmPass')}</FieldLabel><Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} /></FieldRoot>
            <Button variant="outline" onClick={handleChangePassword} disabled={saving} loading={saving} maxW="180px">{t('profile.changePassBtn')}</Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
