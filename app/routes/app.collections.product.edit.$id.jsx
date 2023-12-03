import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  //   console.log("\n\n\n\n");
  //   console.log(`Product is: `);
  //   console.log(product);
  //   console.log("\n\n\n\n");

  return json(product);
}

// Action function
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    // collectionId: params.id,
  };

  console.log("\n\n\n\n");
  console.log(`Params: `);
  console.log(params);
  console.log("\n\n\n\n");

  //   await db.product.create({ data });

  await db.product.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      description: data.description,
    },
  });

  return redirect(`/app/collections/${data.collectionId}`);
}

export default function EditProductPage() {
  const product = useLoaderData();

  const [formState, setFormState] = useState(product);
  const [cleanFormState, setCleanFormState] = useState(product);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const submit = useSubmit();

  // Save form data
  function handleSave() {
    const data = {
      ...product,
      title: formState.title,
      description: formState.description,
    };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  console.log(product);

  return (
    <Page
      backAction={{
        content: `Back to collection`,
        url: `/app/collections/${product.collectionId}`,
      }}
      title={`Edit Product`}
      narrowWidth
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
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
