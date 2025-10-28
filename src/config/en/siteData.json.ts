import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
	name: "SoulNestor",
	// Your website's title and description (meta fields)
	title: "SoulNestor - Mental Health & Mindfulness",
	description:
		"A supportive space dedicated to mental health and mindfulness, offering resources, guidance, and community.",
	// Your information!
	author: {
		name: "SoulNestor Team",
		email: "hello@SoulNestor.com",
		twitter: "soulnestor",
	},

	// default image for meta tags if the page doesn't have an image already
	defaultImage: {
		src: "/images/og/soulnestor-1200x630.jpg",
		alt: "SoulNestor logo",
	},
};

export default siteData;