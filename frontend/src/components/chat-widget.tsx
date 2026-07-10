"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { MessageCircle, X, Send, Headset } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  from: "agent" | "user"
  text: string
}

const GREETING: Message[] = [
  {
    id: 0,
    from: "agent",
    text: "Hi there! 👋 Questions about an order, delivery, or a product? Ask away.",
  },
]

const QUICK_REPLIES = [
  "Where is my order?",
  "Do you offer trade-in?",
  "What's your return policy?",
]

/** Canned replies — there is no chat backend yet, this is a UI demo. */
const CANNED_REPLY =
  "Thanks! One of our specialists will pick this up shortly. In the meantime you might find an answer in our FAQ below."

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(GREETING)
  const [typing, setTyping] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, typing])

  // Focus the field when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      { id: prev.length, from: "user", text: trimmed },
    ])
    setTyping(true)

    // Simulated agent latency — replace with a real transport when one exists.
    window.setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: prev.length, from: "agent", text: CANNED_REPLY },
      ])
    }, 1100)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const field = event.currentTarget.elements.namedItem("message")
    if (!(field instanceof HTMLInputElement)) return
    send(field.value)
    field.value = ""
  }

  return (
    <div className="fixed right-6 bottom-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div

          role="dialog"
          aria-label="Chat with support"
          className="flex h-[30rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-e3"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-brand-primary px-4 py-3 text-white">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Headset className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-small-semibold">ElectroGadget support</span>
              <span className="flex items-center gap-1.5 text-caption text-white/80">
                <span className="size-1.5 shrink-0 rounded-full bg-success" />
                <span className="truncate">Usually replies in minutes</span>
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="size-8 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-bg-primary p-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3.5 py-2.5 text-small",
                  message.from === "agent"
                    ? "self-start rounded-bl-sm bg-surface text-text-primary shadow-e1"
                    : "self-end rounded-br-sm bg-brand-primary text-white"
                )}
              >
                {message.text}
              </div>
            ))}

            {typing && (
              <div
                className="flex items-center gap-1 self-start rounded-lg rounded-bl-sm bg-surface px-3.5 py-3 shadow-e1"
                aria-label="Support is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="size-1.5 animate-bounce rounded-full bg-text-secondary"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Quick replies, only before the visitor has said anything */}
            {messages.length === 1 && !typing && (
              <div className="mt-1 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => send(reply)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption text-text-secondary transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border bg-surface p-3"
          >
            <label htmlFor="chat-message" className="sr-only">
              Type a message
            </label>
            <Input
              ref={inputRef}
              id="chat-message"
              name="message"
              autoComplete="off"
              placeholder="Type a message…"
              className="h-10 rounded-full border-border bg-bg-section px-4 text-small shadow-none focus-visible:bg-surface"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              className="size-10 shrink-0 rounded-full"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Launcher */}
      <Button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="size-14 rounded-full shadow-e3 transition-transform duration-200 hover:scale-105"
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6 fill-white/20" />
        )}
      </Button>
    </div>
  )
}
