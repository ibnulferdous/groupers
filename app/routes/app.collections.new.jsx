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

// Action function
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  console.log("\n\n\n\n");
  console.log(`Form Data: `);
  console.log(data);
  console.log("\n\n\n\n");

  await db.collection.create({ data });

  return redirect(`/app`);
}

export default function CreateCollectionPage() {
  const collection = useLoaderData();

  const [formState, setFormState] = useState({ title: "", description: "" });
  const [cleanFormState, setCleanFormState] = useState(collection);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const navigate = useNavigate();
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
      backAction={{ content: "Groupers", url: "/app" }}
      title="Create New Collection"
      narrowWidth
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <TextField
                  id="title"
                  label="Collection title"
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                />
                <TextField
                  id="description"
                  label="Collection description"
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
