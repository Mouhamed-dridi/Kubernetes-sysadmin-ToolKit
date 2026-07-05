import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Heading, Text, Box, Stack, TableRoot, TableBody,
  TableRow, TableCell, TableHeader, TableColumnHeader, Spinner, Center,
  IconButton, Input, Flex, FieldRoot, FieldLabel, EmptyStateRoot,
  EmptyStateContent, EmptyStateIndicator, EmptyStateTitle, EmptyStateDescription
} from '@chakra-ui/react';
import { Lock, LockKeyhole, Upload } from 'lucide-react';
import { decryptField } from '../api';
import { usePasswords } from '../PasswordsContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { passwords, refreshPasswords, loading } = usePasswords();
  const [unlocked, setUnlocked] = useState({});
  const [decrypted, setDecrypted] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshPasswords();
  }, []);

  const toggleRow = async (id) => {
    if (unlocked[id]) {
      setUnlocked((prev) => ({ ...prev, [id]: false }));
      return;
    }
    const item = passwords.find((p) => p.id === id);
    if (!item) return;
    try {
      const [login, pass] = await Promise.all([
        decryptField(item.encrypted_login).then((r) => r.data.decrypted),
        decryptField(item.encrypted_password).then((r) => r.data.decrypted),
      ]);
      setDecrypted((prev) => ({ ...prev, [id]: { login, pass } }));
      setUnlocked((prev) => ({ ...prev, [id]: true }));
    } catch {
      // ignore
    }
  };

  const hashDisplay = (enc) => {
    if (!enc) return '—';
    const hex = enc.includes(':') ? enc.split(':')[1] : enc;
    return hex.slice(0, 12).toUpperCase();
  };

  const filtered = passwords.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) ||
           (p.encrypted_login && p.encrypted_login.toLowerCase().includes(q));
  });

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
                <TableColumnHeader>Title</TableColumnHeader>
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
