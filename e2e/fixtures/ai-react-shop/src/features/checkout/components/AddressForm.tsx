import type { ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { collectErrors } from "@/shared/lib/formErrors";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { addressSchema, type AddressInput } from "../types";

type AddressFormProps = {
  isPlacing: boolean;
  serverError: string | null;
  onSubmit: (address: AddressInput) => Promise<void>;
};

// The delivery address form; its button places the order.
export function AddressForm({ isPlacing, serverError, onSubmit }: AddressFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "United States" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormAlert messages={collectErrors(errors, serverError)} />
      <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <Input label="Street and number" autoComplete="street-address" error={errors.street?.message} {...register("street")} />
      <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
      <Input label="Postcode or ZIP" autoComplete="postal-code" error={errors.postcode?.message} {...register("postcode")} />
      <Input label="Country" autoComplete="country-name" error={errors.country?.message} {...register("country")} />
      <Button type="submit" fullWidth disabled={isPlacing}>
        {isPlacing ? "Placing your order…" : "Place order"}
      </Button>
    </form>
  );
}
