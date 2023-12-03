import { json, redirect } from "@remix-run/node";
import db from "../db.server";
import { Link, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  IndexTable,
  Layout,
  Page,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { EditMajor, ViewMajor, DeleteMajor } from "@shopify/polaris-icons";
import EmptyStateComponent from "../components/EmptyStateComponent";

export async function loader({ request, params }) {
  const collection = await db.collection.findUnique({
    where: { id: params.id },
    include: {
      products: true,
    },
  });

  return json(collection);
}

// Action function
export async function action({ request, params }) {
  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  await db.product.delete({
    where: {
      id: data.id,
    },
  });

  return redirect(`/app/collections/${params.id}`);
}

// Make text shorter
function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// Products Table
const ProductTable = ({ products, handleDelete }) => (
  <>
    <IndexTable
      resourceName={{
        singular: "Product",
        plural: "Products",
      }}
      itemCount={products.length}
      headings={[
        { title: "Title" },
        { title: "Description" },
        { title: "Action" },
      ]}
      selectable={false}
    >
      {products.map((product) => (
        <ProductTableRow
          key={product.id}
          product={product}
          handleDelete={handleDelete}
        />
      ))}
    </IndexTable>
  </>
);

// Product table row
const ProductTableRow = ({ product, handleDelete }) => (
  <>
    {console.log(product)}
    <IndexTable.Row id={product.id} position={product.id}>
      <IndexTable.Cell>
        <Link to={`/app/collections/products/${product.id}`}>
          <Button variant="plain">{truncate(product.title)}</Button>
        </Link>
      </IndexTable.Cell>
      <IndexTable.Cell>{truncate(product.description)}</IndexTable.Cell>
      <IndexTable.Cell>
        <ButtonGroup>
          <Link to={`/app/collections/products/${product.id}`}>
            <Tooltip content="View" dismissOnMouseOut>
              <Button icon={ViewMajor}></Button>
            </Tooltip>
          </Link>

          <Link to={`/app/collections/product/edit/${product.id}`}>
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
              onClick={() => handleDelete(product)}
            ></Button>
          </Tooltip>
        </ButtonGroup>
      </IndexTable.Cell>
    </IndexTable.Row>
  </>
);

export default function CollectionDetailsPage() {
  const collection = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();

  // Save form data
  function handleDelete(data) {
    submit(data, { method: "post" });
  }

  return (
    <Page
      title="Collection Details"
      backAction={{ content: "Groupers", url: "/app" }}
      primaryAction={{
        content: "Add Product",
        url: `/app/collections/product/new/${collection.id}`,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card padding="500">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h6">
                  Name: {collection.title}
                </Text>
                <Text variant="bodyXs" as="p">
                  Description: {collection.description}
                </Text>
              </BlockStack>
            </Card>

            <Card padding="0">
              {collection.products.length === 0 ? (
                <EmptyStateComponent
                  heading="Add products to your collection"
                  content="Add Product"
                  onAction={() =>
                    navigate(`/app/collections/product/new/${collection.id}`)
                  }
                  text="Bundle your products into collection to better manage your store and show them on the website."
                />
              ) : (
                <ProductTable
                  products={collection.products}
                  handleDelete={handleDelete}
                />
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
