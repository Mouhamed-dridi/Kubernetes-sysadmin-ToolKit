import { useState } from 'react';
import {
  Container, Heading, Text, Box, Stack, Button, Flex, SelectRoot, SelectTrigger,
  SelectValueText, SelectContent, SelectItem,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
} from '@chakra-ui/react';
import { Trash2, Moon, Sun } from 'lucide-react';
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
          <AlertRoot status={message.type}>
            <AlertIndicator /><AlertContent>
              <AlertTitle>{message.type === 'success' ? t('success') : t('error')}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        <Flex gap={4} wrap="wrap">
          <Box flex="1" minW="200px" p={4} borderWidth="1px" borderRadius="lg">
            <Stack gap={3} align="center">
              {mode === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
              <Text fontWeight="medium" fontSize="sm">{t('settings.theme')}</Text>
              <Button variant={mode === 'dark' ? 'solid' : 'outline'} size="sm" px={2} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
                {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
            </Stack>
          </Box>
          <Box flex="1" minW="200px" p={4} borderWidth="1px" borderRadius="lg">
            <Stack gap={3} align="center">
              <Heading size="2xl" fontFamily="mono">{lang === 'ar' ? 'ع' : lang === 'fr' ? 'F' : 'En'}</Heading>
              <Text fontWeight="medium" fontSize="sm">{t('settings.language')}</Text>
              <SelectRoot collection={langCollection} value={[lang]} onValueChange={({ value }) => setLang(value[0])}>
                <SelectTrigger><SelectValueText /></SelectTrigger>
                <SelectContent>
                  {LANG_OPTIONS.map(item => (
                    <SelectItem key={item.value} item={item}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Stack>
          </Box>
        </Flex>

        <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="red.300">
          <Stack gap={4}>
            <Stack direction="row" align="center" gap={3}>
              <Trash2 size={20} color="red" /><Box><Heading size="sm" color="red.500">{t('settings.danger')}</Heading><Text fontSize="sm" color="fg.muted">{t('settings.dangerDesc')}</Text></Box>
            </Stack>
            <Button colorScheme="red" variant="outline" maxW="250px" onClick={handleReset} disabled={resetting} loading={resetting}>{t('settings.dangerBtn')}</Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
