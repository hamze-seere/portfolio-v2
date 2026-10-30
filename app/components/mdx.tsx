import Link from 'next/link'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import { CodeComparison } from '@/components/ui/code-comparison'

/* MDX renderer — from the Vercel portfolio starter, typed for strict TS. */

function CustomLink({ href = '', children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith('/')) return <Link href={href} {...props}>{children}</Link>
  if (href.startsWith('#')) return <a href={href} {...props}>{children}</a>
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
}

function Code({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  // sugar-high escapes source text before wrapping tokens in spans.
  return <code dangerouslySetInnerHTML={{ __html: highlight(String(children)) }} {...props} />
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

function createHeading(level: 2 | 3 | 4) {
  const Heading = ({ children }: { children?: React.ReactNode }) => {
    const slug = slugify(textOf(children))
    return React.createElement(`h${level}`, { id: slug }, React.createElement('a', { href: `#${slug}`, className: 'anchor', 'aria-hidden': true }), children)
  }
  Heading.displayName = `Heading${level}`
  return Heading
}

const components = { h2: createHeading(2), h3: createHeading(3), h4: createHeading(4), a: CustomLink, code: Code, CodeComparison }

export function CustomMDX(props: MDXRemoteProps) {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}
