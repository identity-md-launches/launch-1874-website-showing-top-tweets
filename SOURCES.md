# Sources and collection method

Captured on 15 October 2026. This is an editorial selection of nine public posts from six accounts, sorted in the interface by captured likes, reposts, or original posting time. It is not an exhaustive X leaderboard or an automatically refreshed feed.

Each ID, author, publication timestamp, excerpt, and engagement count was retrieved from the public FxTwitter JSON endpoint. The build-time check compared each displayed quotation to the returned post text or the content of its linked article. No quoted passage exceeds 25 words. “In context” text is an editorial summary, not an additional quotation. Public search results were used to discover posts; status-level JSON, rather than inconsistent profile-page snippets, supplied the delivered records.

The source metadata is embedded in `src/posts.json`; the production site makes no requests to this API. Saved counts may differ from current X figures. Search results or authors’ claims were not treated as independently verified claims about the protocol.

| Original post | Published (UTC) | Likes | Reposts | Replies | Capture source |
| --- | --- | ---: | ---: | ---: | --- |
| [@surfcoderepeat](https://x.com/surfcoderepeat/status/2105853348188459389) | 2026-10-02 | 368 | 103 | 26 | [Public JSON](https://api.fxtwitter.com/status/2105853348188459389) |
| [@tradeguru](https://x.com/tradeguru/status/2108165522168987723) | 2026-10-08 | 303 | 67 | 40 | [Public JSON](https://api.fxtwitter.com/status/2108165522168987723) |
| [@notwashed](https://x.com/notwashed/status/2106085777407164654) | 2026-10-02 | 245 | 39 | 32 | [Public JSON](https://api.fxtwitter.com/status/2106085777407164654) |
| [@notwashed](https://x.com/notwashed/status/2103217179319828726) | 2026-09-24 | 227 | 13 | 26 | [Public JSON](https://api.fxtwitter.com/status/2103217179319828726) |
| [@AdamOnFinance](https://x.com/AdamOnFinance/status/2103503168327860473) | 2026-09-25 | 191 | 33 | 27 | [Public JSON](https://api.fxtwitter.com/status/2103503168327860473) |
| [@surfcoderepeat](https://x.com/surfcoderepeat/status/2096592364391240143) | 2026-09-06 | 144 | 23 | 18 | [Public JSON](https://api.fxtwitter.com/status/2096592364391240143) |
| [@pegzeus](https://x.com/pegzeus/status/2105396759342059873) | 2026-09-30 | 94 | 17 | 4 | [Public JSON](https://api.fxtwitter.com/status/2105396759342059873) |
| [@Keeperssd](https://x.com/Keeperssd/status/2107535004385317027) | 2026-10-06 | 86 | 27 | 8 | [Public JSON](https://api.fxtwitter.com/status/2107535004385317027) |
| [@surfcoderepeat](https://x.com/surfcoderepeat/status/2107939456732873147) | 2026-10-07 | 79 | 14 | 5 | [Public JSON](https://api.fxtwitter.com/status/2107939456732873147) |

## Profile images

Images are downloaded copies of the avatar URLs returned with the same public posts, used solely to identify the attributed accounts. All are served locally from `public/avatars/`; there are no remote image dependencies.
- @surfcoderepeat: [avatars/surfcoderepeat.jpg](https://pbs.twimg.com/profile_images/1707558009776242688/Mu8g3JM2_200x200.jpg)
- @tradeguru: [avatars/tradeguru.jpg](https://pbs.twimg.com/profile_images/2103908152404017152/sP1VFkVb_200x200.jpg)
- @notwashed: [avatars/notwashed.jpg](https://pbs.twimg.com/profile_images/2049519738943111168/7I48TlSr_200x200.jpg)
- @AdamOnFinance: [avatars/AdamOnFinance.jpg](https://pbs.twimg.com/profile_images/2102060356281516032/bHvfvX1m_200x200.jpg)
- @pegzeus: [avatars/pegzeus.jpg](https://pbs.twimg.com/profile_images/2091947302889967616/YEg3ESgY_200x200.jpg)
- @Keeperssd: [avatars/Keeperssd.jpg](https://pbs.twimg.com/profile_images/2082816158625894400/zBS5c4uB_200x200.jpg)

## Updating records

1. Select relevant public Identity.md posts and retrieve their status-level source data. Use the exact original IDs and account handles.
2. Verify excerpts against the original text or linked article, retain short quotations, and label any additional prose as editorial context.
3. Update `src/posts.json`, including counts, original UTC timestamp, source URL, and local avatar path. Preserve the recorded post ID as the bookmark key.
4. Update `CAPTURED` in `src/App.tsx` and this source ledger to the actual new capture date. The website computes its post and author totals from the records.
5. Run `npm run typecheck`, `npm run build`, the interaction validation, and `npm run check:export`. Revisit hard-coded dataset expectations in the validation suite when deliberately changing the collection.

External links may require an X login or become unavailable. No availability guarantee is made.
