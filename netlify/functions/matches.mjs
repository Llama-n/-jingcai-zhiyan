export default async () => {
  const url = "https://webapi.sporttery.cn/gateway/uniform/football/getMatchCalculatorV1.qry";

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.sporttery.cn/",
        "Origin": "https://www.sporttery.cn",
        "Accept": "application/json, text/plain, */*"
      }
    });

    const text = await r.text();

    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: `体彩接口 HTTP ${r.status}` }),
        {
          status: 502,
          headers: { "content-type": "application/json" }
        }
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "体彩接口返回非JSON数据" }),
        {
          status: 502,
          headers: { "content-type": "application/json" }
        }
      );
    }

    const list =
      data?.value?.matchInfoList ||
      data?.data?.matchInfoList ||
      data?.value?.list ||
      data?.data?.list;

    if (!Array.isArray(list)) {
      return new Response(
        JSON.stringify({
          error: "接口字段暂无法确认，请使用官方截图导入"
        }),
        {
          status: 502,
          headers: { "content-type": "application/json" }
        }
      );
    }

    const matches = list.map(x => ({
      id: x.matchNum || x.matchCode || "",
      home: x.homeTeamName || "",
      away: x.awayTeamName || "",
      h: x.h || "",
      d: x.d || "",
      a: x.a || "",
      handicap: x.letBall ?? "",
      lh: x.lh || "",
      ld: x.ld || "",
      la: x.la || ""
    }));

    return new Response(
      JSON.stringify({
        matches,
        count: matches.length,
        fetchedAt: new Date().toISOString()
      }),
      {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store"
        }
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "请求体彩接口失败：" + e.message
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" }
      }
    );
  }
};
