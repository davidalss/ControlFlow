"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const TutorialDialog = DialogPrimitive.Root

const TutorialDialogTrigger = DialogPrimitive.Trigger

const TutorialDialogPortal = DialogPrimitive.Portal

const TutorialDialogClose = DialogPrimitive.Close

const TutorialDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
))
TutorialDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const TutorialDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TutorialDialogPortal>
    <TutorialDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </TutorialDialogPortal>
))
TutorialDialogContent.displayName = DialogPrimitive.Content.displayName

const TutorialDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
TutorialDialogHeader.displayName = "TutorialDialogHeader"

const TutorialDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
TutorialDialogFooter.displayName = "TutorialDialogFooter"

const TutorialDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
TutorialDialogTitle.displayName = DialogPrimitive.Title.displayName

const TutorialDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
TutorialDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  TutorialDialog,
  TutorialDialogPortal,
  TutorialDialogOverlay,
  TutorialDialogClose,
  TutorialDialogTrigger,
  TutorialDialogContent,
  TutorialDialogHeader,
  TutorialDialogFooter,
  TutorialDialogTitle,
  TutorialDialogDescription,
}
