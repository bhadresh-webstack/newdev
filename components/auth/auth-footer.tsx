import Link from "next/link"

interface AuthFooterProps {
  text: string
  linkText: string
  linkHref: string
}

export default function AuthFooter({ text, linkText, linkHref }: AuthFooterProps) {
  return (
    <div className="text-center text-sm font-light">
      {text}{" "}
      <Link href={linkHref} className="text-primary hover:underline font-normal">
        {linkText}
      </Link>
    </div>
  )
}
