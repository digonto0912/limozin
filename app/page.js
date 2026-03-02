"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PRODUCT_ID } from "./config/products";
import Loading from "./components/Loading";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default product dashboard
    router.replace(`/product/${DEFAULT_PRODUCT_ID}`);
  }, [router]);

  // Show loading while redirecting
  return <Loading />;
}