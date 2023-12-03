import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  BlockStack,
  Card,
  FormLayout,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request, params }) {
  const collection = await db.collection.findUnique({
    where: { id: params.id },
  });

  // console.log("\n\n\n\n");
  // console.log(`Collection: `);
  // console.log(collection);
  // console.log("\n\n\n\n");

  return json(collection);
}

// Action function
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    collectionId: params.id,
  };

  console.log("\n\n\n\n");
  console.log(`Form Data: `);
  console.log(data);
  console.log("\n\n\n\n");

  await db.product.create({ data });

  return redirect(`/app/collections/${params.id}`);
}

export default function CreateProductPage() {
  const collection = useLoaderData();

  const [formState, setFormState] = useState({ title: "", description: "" });
  const [cleanFormState, setCleanFormState] = useState(collection);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const submit = useSubmit();

  // Save form data
  function handleSave() {
    const data = {
      title: formState.title,
      description: formState.description,
    };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page
      backAction={{
        content: `${collection.title}`,
        url: `/app/collections/${collection.id}`,
      }}
      title={`Add Product`}
      subtitle={`to "${collection.title}"`}
      narrowWidth
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card padding="500">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h6">
                  Collection Title: {collection.title}
                </Text>
                <Text variant="bodyXs" as="p">
                  Description: {collection.description}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="500">
                <TextField
                  id="title"
                  label="Product Title"
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                />
                <TextField
                  id="description"
                  label="Product description"
                  autoComplete="off"
                  multiline={4}
                  value={formState.description}
                  onChange={(description) =>
                    setFormState({ ...formState, description })
                  }
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
