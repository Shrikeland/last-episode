'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function mapAuthError(message: string): string {
  if (message.includes('User already registered')) return 'Пользователь с таким email уже существует'
  if (message.includes('Password should be at least')) return 'Пароль должен содержать минимум 6 символов'
  return 'Не удалось создать аккаунт. Попробуйте снова'
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(mapAuthError(error.message))
      } else if (!data.session) {
        // Email confirmation включена в Supabase — сессия не создана сразу
        toast.info('Проверьте email для подтверждения регистрации')
      } else {
        toast.success('Аккаунт создан!')
        router.push('/library')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md" data-testid="register-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Создать аккаунт
        </CardTitle>
        <CardDescription>
          Начните отслеживать свои фильмы и сериалы
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              data-testid="register-email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              data-testid="register-password-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Повторите пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              data-testid="register-confirm-password-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="register-submit-button"
          >
            {isLoading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
            data-testid="register-login-link"
          >
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}