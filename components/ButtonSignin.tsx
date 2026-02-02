"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import config from "@/config";

// A simple button to sign in. Redirects to the login page or dashboard if already authenticated.
const ButtonSignin = ({
  text = "Get started",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleClick = () => {
    if (user) {
      router.push(config.auth.callbackUrl);
    } else {
      router.push(config.auth.loginUrl);
    }
  };

  if (loading) {
    return (
      <button className={`btn ${extraStyle ? extraStyle : ""}`} disabled>
        {text}
      </button>
    );
  }

  if (user) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
          {user.email?.charAt(0)?.toUpperCase() || "U"}
        </span>
        {user.user_metadata?.full_name || user.email || "Account"}
      </Link>
    );
  }

  return (
    <button
      className={`btn ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default ButtonSignin;
