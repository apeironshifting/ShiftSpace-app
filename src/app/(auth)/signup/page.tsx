
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signup, users } = useUser();
  const [error, setError] = useState('');

  const handleSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Username already taken locally.');
        return;
    }

    signup(name, username);
    router.push('/dashboard');
  };

  return (
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{t('signup.title')}</CardTitle>
          <CardDescription>{t('signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">{t('signup.name_label')}</Label>
              <Input id="name" name="name" placeholder={t('signup.name_label')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t('signup.username_label')}</Label>
              <Input id="username" name="username" placeholder="your_username" required />
              <p className="text-xs text-muted-foreground">{t('signup.username_hint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input id="email" type="email" placeholder="shifter@example.com" required />
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
              {t('signup.title')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('signup.already_have_account')}{' '}
            <Link href="/login" className="underline">
              {t('signup.sign_in_link')}
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}
