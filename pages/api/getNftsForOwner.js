import { Network, Alchemy, NftFilters } from "alchemy-sdk";

export default async function handler(req, res) {
	const { address, pageSize, chain, excludeFilter, pageKey } = JSON.parse(
		req.body
	);
	if (req.method !== "POST") {
		res.status(405).send({ message: "Only POST requests allowed" });
		return;
	}

	const settings = {
		apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
		network: Network[chain],
	};

	const alchemy = new Alchemy(settings);

	try {
		const nfts = await alchemy.nft.getNftsForOwner(address, {
			pageSize: pageSize ? pageSize : 100,
			excludeFilters: excludeFilter && [NftFilters.SPAM],
			pageKey: pageKey ? pageKey : "",
		});

		const formattedNfts = nfts.ownedNfts.map((nft) => {
			const { contract, title, tokenType, tokenId, description, media } =
				nft;
			console.log(nft.media);
			return {
				contract: contract.address,
				symbol: contract.symbol,
				collectionName: contract.name,
				media: media.length > 0 ? media[0] : "https://via.placeholder.com/500",
				verified: contract.openSea?.safelistRequestStatus,
				tokenType,
				tokenId,
				title,
				description,
				format: media.length > 0 ?.format ? media[0]?.format : "png",
			};
		});
		if (excludeFilter) {
			const filteredNfts = formattedNfts.filter(
				(nft) => nft.title.length && nft.description.length && nft.media
			);
			if (filteredNfts) {
				res.status(200).json({
					nfts: filteredNfts.length ? filteredNfts : null,
					pageKey: nfts.pageKey,
				});
			}
		} else {
			res.status(200).json({
				nfts: formattedNfts.length ? formattedNfts : null,
				pageKey: nfts.pageKey,
			});
		}
	} catch (e) {
		console.warn(e);
		res.status(500).send({
			message: "something went wrong, check the log in your terminal",
		});
	}
}
