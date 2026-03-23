import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function EmailConfirmedPage() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle className="h-12 w-12 text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Email подтверждён!</h2>
          <p className="text-sm text-muted-foreground">
            Вы успешно подтвердили почту. Теперь вы можете{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              авторизоваться
            </Link>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  )
}