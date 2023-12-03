import { useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
  Link,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
  IndexTable,
  Icon,
  ButtonGroup,
  Tooltip,
} from "@shopify/polaris";
import { EditMajor, ViewMajor, DeleteMajor } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import EmptyStateComponent from "../components/EmptyStateComponent";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const collections = await db.collection.findMany({
    where: { shop: session.shop },
  });

  return json(collections);
};

// Action function
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  // console.log("\n\n\n\n");
  // console.log(`Data is: `);
  // console.log(data);
  // console.log("\n\n\n\n");

  const deleteCollection = await db.collection.delete({
    where: {
      id: data.id,
    },
  });

  return redirect(`/app`);
}

// Make text shorter
function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// Collections Table
const CollectionTable = ({ collections, handleDelete }) => (
  <IndexTable
    resourceName={{
      singular: "Collection",
      plural: "Collections",
    }}
    itemCount={collections.length}
    headings={[
      { title: "Title" },
      { title: "Description" },
      { title: "Action" },
    ]}
    selectable={false}
  >
    {collections.map((collection) => (
      <CollectionTableRow
        key={collection.id}
        collection={collection}
        handleDelete={handleDelete}
      />
    ))}
  </IndexTable>
);

// Collection table row
const CollectionTableRow = ({ collection, handleDelete }) => (
  <IndexTable.Row id={collection.id} position={collection.id}>
    <IndexTable.Cell>
      <Link to={`collections/${collection.id}`}>
        <Button variant="plain">{truncate(collection.title)}</Button>
      </Link>
    </IndexTable.Cell>
    <IndexTable.Cell>{truncate(collection.description)}</IndexTable.Cell>
    <IndexTable.Cell>
      <ButtonGroup>
        <Link to={`collections/${collection.id}`}>
          <Tooltip content="View" dismissOnMouseOut>
            <Button icon={ViewMajor}></Button>
          </Tooltip>
        </Link>
        <Link to={`collections/edit/${collection.id}`}>
          <Tooltip content="Edit" dismissOnMouseOut>
            <Button icon={EditMajor}></Button>
          </Tooltip>
        </Link>
        <Tooltip content="Delete" dismissOnMouseOut>
          <Button
            variant="primary"
            tone="critical"
            destructive="true"
            icon={DeleteMajor}
            onClick={() => handleDelete(collection)}
          ></Button>
        </Tooltip>
      </ButtonGroup>
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const collections = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();

  // Save form data
  function handleDelete(data) {
    submit(data, { method: "post" });
    // console.log(data);
  }

  return (
    <Page
      title="Collection List"
      primaryAction={{
        content: "Create Collection",
        url: "/app/collections/new",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {collections.length === 0 ? (
              <EmptyStateComponent
                heading="Create Collection for your products"
                content="Create Collection"
                onAction={() => navigate("/app/collections/new")}
                text="Group your products into collections to make it easier for customers to find them by category"
              />
            ) : (
              <CollectionTable
                collections={collections}
                handleDelete={handleDelete}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
