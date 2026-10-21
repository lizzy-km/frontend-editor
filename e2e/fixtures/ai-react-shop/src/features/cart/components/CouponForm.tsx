import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { COUPON_CODE } from "../constants";
import { couponSchema, type CouponInput } from "../types";
import styles from "./CouponForm.module.css";

type CouponFormProps = {
  appliedCoupon: string | null;
  onApply: (code: string) => boolean;
};

// A small form where people type a coupon code; it says in plain words whether it worked.
export function CouponForm({ appliedCoupon, onApply }: CouponFormProps): ReactElement {
  const [isUnknown, setIsUnknown] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponInput>({ resolver: zodResolver(couponSchema) });

  const onSubmit = handleSubmit((values) => {
    const isApplied = onApply(values.code);
    setIsUnknown(!isApplied);
    if (isApplied) reset();
  });

  if (appliedCoupon) {
    return (
      <p className={styles.applied} role="status">
        Coupon {appliedCoupon} is applied: 10% off your items.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Input
        label="Coupon code"
        hint={`Try ${COUPON_CODE} for 10% off.`}
        autoComplete="off"
        error={errors.code?.message ?? (isUnknown ? "We do not know that code. Check the spelling." : undefined)}
        {...register("code")}
      />
      <Button type="submit" variant="secondary">
        Apply coupon
      </Button>
    </form>
  );
}
