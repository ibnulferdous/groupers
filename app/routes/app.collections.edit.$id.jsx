import { authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import db from "../db.server";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const collection = await db.collection.findUnique({
    where: { id: params.id },
  });

  //   console.log("\n\n\n\n");
  //   console.log(`Collection is: `);
  //   console.log(collection);
  //   console.log("\n\n\n\n");

  return json(collection);
}

// Action function
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  //   const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  await db.collection.update({
    where: {
      id: params.id,
    },
    data: {
      ...data,
    },
  });

  return redirect(`/app`);
}

export default function EditCollectionPage() {
  const collection = useLoaderData();
  const [formState, setFormState] = useState(collection);
  const [cleanFormState, setCleanFormState] = useState(collection);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const navigate = useNavigate();
  const submit = useSubmit();

  console.log(collection);

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
      backAction={{ content: "Collections", url: "/app" }}
      title="Edit Collection"
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
              content: "Save Changes",
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
