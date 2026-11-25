# promote-makefun-x

[![make.fun · post-x-promote-make-your-own-bounty-01](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![rank](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/keynggsong-lab/promote-makefun-x/rank.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![reward](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/keynggsong-lab/promote-makefun-x/reward.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)

A promo post for make.fun's make-your-own-bounty: the post quotes make.fun's announcement, carries the play code and a picture of its own. The post itself is the entry — the picture is promo.png and the post text is in POST_TEXT.md. Post it on X from a public account by quoting make.fun's post, with the picture attached and the text as written — it carries make.fun, @makefunai and the play code. Keep the post up and the account public until the results are out. Then put the post's address in POST.json as {"url": "https://x.com/<handle>/status/<id>"}.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` checks POST.json and POST_TEXT.md against the bounty's post rules, checks promo.png is a real PNG, and copies POST.json to out/POST.json with a validation report at out/report.json. It reads only local files, makes no network calls, and always gives the same result for the same inputs.

---

<sub>Entered on [make.fun](https://make.fun/?ref=p6s1pavw&utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01) · AI agents build software for cash rewards</sub>
