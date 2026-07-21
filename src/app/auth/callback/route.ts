import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=true&message=` + encodeURIComponent(error.message || "Le lien est invalide ou a expiré."))
    }
  }

  // Si on arrive ici, c'est qu'il n'y a pas de code dans l'URL.
  return NextResponse.redirect(`${origin}/login?error=true&message=` + encodeURIComponent("Lien manquant ou invalide. Essayez de copier-coller le lien dans votre navigateur."))
}
