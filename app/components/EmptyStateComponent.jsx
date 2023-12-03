import { EmptyState } from "@shopify/polaris";

export default function EmptyStateComponent({
  heading,
  content,
  onAction,
  text,
}) {
  return (
    <EmptyState
      heading={heading}
      action={{
        content,
        onAction,
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>{text}</p>
    </EmptyState>
  );
}
