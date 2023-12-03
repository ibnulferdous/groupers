import { json } from "@remix-run/node";
import { BlockStack, Button, Layout, MediaCard, Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import db from "../db.server";

// Loader function
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Mongodb- getting data from DB
  const shopUid = await db.session.findFirst({
    where: { id: "offline_tools-iot.myshopify.com" },
  });

  const response = await admin.graphql(
    `#graphql
    query GetShopDetails {
      shop {
        id
        name
      }
    }`
  );

  const responseJson = await response.json();

  // console.log(`\n\n\n`);
  // console.log("shopUid is here");
  // console.log(shopUid);
  // console.log(`\n\n\n`);

  return json({
    shop: responseJson.data.shop,
  });
};

export default function ShopInfoPage() {
  const { shop } = useLoaderData();
  const navigate = useNavigate();
  const shopId = shop?.id?.replace("gid://shopify/Shop/", "");

  return (
    <Page
      title="Shop Info"
      narrowWidth
      backAction={{ content: "Collections", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <MediaCard
              title={`Shop name: ${shop.name}`}
              primaryAction={{
                content: "Back",
                onAction: () => {
                  navigate("/app");
                },
              }}
              description={`Shop id: ${shopId || shop.id}`}
            >
              <img
                alt=""
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src="https://cdn.shopify.com/s/files/1/0533/2089/files/checkout-extensibility.jpg?v=1655843462&width=1024"
              />
            </MediaCard>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
