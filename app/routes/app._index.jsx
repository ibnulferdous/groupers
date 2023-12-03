import { useEffect } from "react";
import { json } from "@remix-run/node";
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
  EmptyState,
  IndexTable,
  Icon,
  ButtonGroup,
} from "@shopify/polaris";
import { EditMajor, ViewMajor } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const collections = await db.collection.findMany({
    where: { shop: session.shop },
  });

  // console.log("\n\n\n\n");
  // console.log(`collections:`);
  // console.log(collections);
  // console.log("\n\n\n\n");

  return json(collections);
};

// Make text shorter
function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// Empty Collection Component
const EmptyCollectionState = ({ onAction }) => (
  <EmptyState
    heading="Create Collection for your products"
    action={{
      content: "Create Collection",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>
      Group your products into collections to make it easier for customers to
      find them by category
    </p>
  </EmptyState>
);

// Collections Table
const CollectionTable = ({ collections }) => (
  <IndexTable
    resourceName={{
      singular: "Collection",
      plural: "Collections",
    }}
    itemCount={collections.length}
    headings={[
      { title: "Title" },
      { title: "Description" },
      { title: "Edit", hidden: true },
    ]}
    selectable={false}
  >
    {collections.map((collection) => (
      <CollectionTableRow key={collection.id} collection={collection} />
    ))}
  </IndexTable>
);

// Collection table row
const CollectionTableRow = ({ collection }) => (
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
          <Button icon={ViewMajor}></Button>
        </Link>
        <Link to={`collections/edit/${collection.id}`}>
          <Button icon={EditMajor}></Button>
        </Link>
      </ButtonGroup>
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const collections = useLoaderData();
  const navigate = useNavigate();

  // console.log(collections);

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
              <EmptyCollectionState
                onAction={() => navigate("/app/collections/new")}
              />
            ) : (
              <CollectionTable collections={collections} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
