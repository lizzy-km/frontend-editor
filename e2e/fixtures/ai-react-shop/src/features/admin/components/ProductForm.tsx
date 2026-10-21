import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Category, Product, ProductInput } from "@/features/catalog";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { collectErrors } from "@/shared/lib/formErrors";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { toFormValues, toProductInput } from "../lib/productForm";
import { productFormSchema, type ProductFormValues } from "../types";
import styles from "./ProductForm.module.css";

const SAVE_FALLBACK = "We could not save the product. Please try again.";

type ProductFormProps = {
  product: Product | null;
  categories: Category[];
  onSave: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
};

// The add and edit form for one product.
export function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps): ReactElement {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: toFormValues(product) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave(toProductInput(values));
    } catch (error) {
      setServerError(getErrorMessage(error, SAVE_FALLBACK));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormAlert messages={collectErrors(errors, serverError)} />
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Select label="Category" error={errors.categoryId?.message} {...register("categoryId")}>
        <option value="">Choose a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <div className={styles.pair}>
        <Input label="Price in USD" inputMode="decimal" error={errors.price?.message} {...register("price")} />
        <Input label="In stock" inputMode="numeric" error={errors.stock?.message} {...register("stock")} />
      </div>
      <Input label="Sizes" hint="Separate with commas, for example S, M, L." error={errors.sizes?.message} {...register("sizes")} />
      <Input label="Colours" hint="Separate with commas, for example Sand, Olive." error={errors.colours?.message} {...register("colours")} />
      <Input label="Main picture address" type="url" error={errors.image?.message} {...register("image")} />
      <Textarea label="Description" error={errors.description?.message} {...register("description")} />
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save product"}
        </Button>
      </div>
    </form>
  );
}
