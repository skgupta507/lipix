"use client";

import React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AtSign,
  Eye,
  EyeOff,
  Fingerprint,
  Key,
  Loader2,
  Mail,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { createNewAccount, resetPassword } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { authSchema } from "@/lib/validations";
import { toast } from "@/hooks/use-toast";
import { GitHub, Google } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormData = z.infer<typeof authSchema>;
type AuthFormProps = { mode: "login" | "signup" | "reset" };

const defaultValues: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function AuthForm({ mode }: AuthFormProps) {
  const [isEmailMode, setIsEmailMode] = React.useState(true);
  const [isPassVisible, setIsPassVisible] = React.useState(false);
  const [isConfirmPassVisible, setIsConfirmPassVisible] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<"google" | "github">();

  const form = useForm<FormData>({
    resolver: zodResolver(authSchema),
    defaultValues,
    mode: "onChange",
  });

  function signInToaster() {
    toast({
      title: "Signing in...",
      description: "Please wait while we sign you in",
    });
  }

  async function onSubmit({ email, username, password }: FormData) {
    try {
      if (mode === "login") {
        signInToaster();
        await signIn("credentials", { username, email, password });
      } else if (mode === "signup") {
        toast({
          title: "Creating account...",
          description: "Please wait while we create your account",
        });
        await createNewAccount({ mode: "email", email: email!, password });
      } else {
        toast({
          title: "Resetting password...",
          description: "Please wait while we reset your password",
        });
        await resetPassword({ mode: "email", email: email!, password });
      }
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    }
  }

  async function googleSignInHandler() {
    setOauthLoading("google");

    try {
      signInToaster();
      await signIn("google");
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    }

    setOauthLoading(undefined);
  }

  async function githubSignInHandler() {
    setOauthLoading("github");

    try {
      signInToaster();
      await signIn("github");
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    }

    setOauthLoading(undefined);
  }

  const toggleCredentialMode = () => setIsEmailMode(!isEmailMode);
  const togglePassVisibility = () => setIsPassVisible(!isPassVisible);
  const toggleConfirmPassVisibility = () =>
    setIsConfirmPassVisible(!isConfirmPassVisible);

  const isFormDisabled = !!oauthLoading || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <Link
        href={mode === "login" ? "/signup" : "/login"}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        {mode === "login" ? "Sign Up" : "Login"}
      </Link>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-2">
        <FormField
          name={isEmailMode ? "email" : "username"}
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="sr-only">
                {isEmailMode ? "Email" : "Username"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isEmailMode ? "email" : "text"}
                    disabled={isFormDisabled}
                    placeholder={isEmailMode ? "you@domain.com" : "@username"}
                    className={cn("shadow-sm", mode === "login" && "pr-8")}
                    {...field}
                  />
                  {mode === "login" && (
                    <Tooltip delayDuration={150}>
                      <TooltipTrigger
                        type="button"
                        onClick={toggleCredentialMode}
                        className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isEmailMode ? (
                          <AtSign className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                      </TooltipTrigger>

                      <TooltipContent>
                        <p className="text-xs">
                          {isEmailMode
                            ? "Use Username instead"
                            : "Use Email instead"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isPassVisible ? "text" : "password"}
                    disabled={isFormDisabled}
                    placeholder="••••••••••"
                    className="pr-8 shadow-sm"
                    {...field}
                  />
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger
                      type="button"
                      disabled={!field.value}
                      onClick={togglePassVisibility}
                      className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isPassVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="text-xs">
                        {isPassVisible ? "Hide Password" : "Show Password"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode !== "login" && (
          <FormField
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="sr-only">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isConfirmPassVisible ? "text" : "password"}
                      disabled={isFormDisabled}
                      placeholder="••••••••••"
                      className="pr-8 shadow-sm"
                      {...field}
                    />
                    <Tooltip delayDuration={150}>
                      <TooltipTrigger
                        type="button"
                        disabled={!field.value}
                        onClick={toggleConfirmPassVisibility}
                        className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isConfirmPassVisible ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </TooltipTrigger>

                      <TooltipContent>
                        <p className="text-xs">
                          {isConfirmPassVisible
                            ? "Hide Password"
                            : "Show Password"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isFormDisabled}
          className="w-full shadow-md"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === "reset" ? (
                <Key className="mr-2 h-4 w-4" />
              ) : (
                <>
                  {isEmailMode ? (
                    <Mail className="mr-2 h-4 w-4" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                </>
              )}
            </>
          )}
          {mode === "reset" && "Reset Password"}
          {mode === "login" && (isEmailMode ? "Login with Email" : "Login")}
          {mode === "signup" && "Sign Up with Email"}
        </Button>
      </form>

      {mode === "login" && (
        <p className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          <Link href="/reset-password">Forgot password?</Link>
        </p>
      )}

      <div className="relative my-4">
        <span className="absolute inset-x-0 inset-y-1/2 border-t" />

        <span className="relative mx-auto flex w-fit bg-background px-2 text-xs uppercase text-muted-foreground transition-colors duration-0">
          Or continue with
        </span>
      </div>

      <div className="mt-6 flex w-full flex-col space-y-2 text-white">
        <Button
          onClick={googleSignInHandler}
          disabled={isFormDisabled}
          className="w-full shadow-md"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>

        <Button
          onClick={githubSignInHandler}
          disabled={isFormDisabled}
          className="w-full shadow-md"
        >
          {oauthLoading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GitHub className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </Form>
  );
}
