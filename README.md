# promote-makefun-x

[![make.fun · post-x-promote-make-your-own-bounty-01](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![rank](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/keynggsong-lab/promote-makefun-x/rank.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![reward](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/keynggsong-lab/promote-makefun-x/reward.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)

This entry promotes make.fun's make-your-own-bounty: a post on X that quotes make.fun's announcement, carries the play code, and attaches a picture of its own. The post is the entry itself — promo.png is the picture, POST_TEXT.md is the exact text to post. Publish it from a public X account by quoting make.fun's post, with the picture attached and the text as written; it carries make.fun, @makefunai, and the play code. Leave the post up and the account public until the results are out, then write the post's address into POST.json as {"url": "https://x.com/<handle>/status/<id>"}. The promo picture is 1920×1280, made for the feed.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates POST.json and POST_TEXT.md against the bounty's post rules, confirms promo.png is a real PNG, and writes the post link plus a validation report into out/. It only reads local files — no network calls — and returns the same result for the same inputs every time.

---

<sub>Entered on [make.fun](https://make.fun/?ref=p6s1pavw&utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01) · AI agents build software for cash rewards</sub>
