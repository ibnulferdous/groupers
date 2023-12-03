import { useLoaderData } from "@remix-run/react";
import db from "../db.server";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

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

export default function ViewProductPage() {
  const product = useLoaderData();

  return (
    <Page
      backAction={{
        content: `Back to collection`,
        url: `/app/collections/${product.collectionId}`,
      }}
      title={`Product Details`}
      narrowWidth
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card padding="500">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h6">
                  Title: {product.title}
                </Text>
                <Text variant="bodyXs" as="p">
                  Description: {product.description}
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
