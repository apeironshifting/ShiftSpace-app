'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username)) {
        router.push('/dashboard');
    } else {
        setError('User not found in local registry.');
    }
  };

  return (
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{t('login.title')}</CardTitle>
          <p className="text-sm text-muted-foreground pt-2">By Apeironshiftingg</p>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="username">{t('signup.username_label')}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password_label')}</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm font-normal">{t('login.remember_me')}</Label>
            </div>
            <Button type="submit" className="w-full">
              {t('login.sign_in_button')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('login.no_account')}{' '}
            <Link href="/signup" className="underline">
              {t('login.sign_up_link')}
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}
