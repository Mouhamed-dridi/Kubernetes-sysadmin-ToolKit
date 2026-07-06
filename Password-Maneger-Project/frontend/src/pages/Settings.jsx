import { useState } from 'react';
import {
  Container, Heading, Text, Box, Stack, Button, Flex, SelectRoot, SelectTrigger,
  SelectValueText, SelectContent, SelectItem,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { createListCollection } from '@ark-ui/react';
import { resetData } from '../api';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useLang } from '../LangContext';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
];
const langCollection = createListCollection({ items: LANG_OPTIONS });

export default function Settings() {
  const { logout } = useAuth();
  const { mode, setMode } = useTheme();
  const { t, lang, setLang } = useLang();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetting, setResetting] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
        <Box><Heading size="lg" mb={2}>{t('settings.title')}</Heading><Text color="fg.muted">{t('settings.subtitle')}</Text></Box>

        {message.text && (
          <Box p={3} bg={message.type === 'success' ? 'green.50' : 'red.50'} borderRadius="md">
            <Text fontSize="sm" color={message.type === 'success' ? 'green.600' : 'red.600'}>{message.text}</Text>
          </Box>
        )}

        <Flex direction="column" gap={6}>
          <Flex align="center" gap={4}>
            <Text fontWeight="medium" minW="100px">{t('settings.theme')}</Text>
            <Button variant={mode === 'dark' ? 'solid' : 'outline'} size="sm" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
              {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </Flex>

          <Flex align="center" gap={4}>
            <Text fontWeight="medium" minW="100px">{t('settings.language')}</Text>
            <SelectRoot collection={langCollection} value={[lang]} onValueChange={({ value }) => setLang(value[0])}>
              <SelectTrigger><SelectValueText /></SelectTrigger>
              <SelectContent>
                {LANG_OPTIONS.map(item => (
                  <SelectItem key={item.value} item={item}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Flex>
        </Flex>

        <Box borderTopWidth="1px" pt={6}>
          <Stack gap={4}>
            <Flex align="center" gap={3}>
              <Trash2 size={20} color="red" /><Box><Heading size="sm" color="red.500">{t('settings.danger')}</Heading><Text fontSize="sm" color="fg.muted">{t('settings.dangerDesc')}</Text></Box>
            </Flex>
            <Button colorScheme="red" variant="outline" maxW="250px" onClick={handleReset} disabled={resetting} loading={resetting}>{t('settings.dangerBtn')}</Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
