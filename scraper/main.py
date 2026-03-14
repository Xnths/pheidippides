from abc import ABC, abstractmethod
from fastapi import FastAPI, Query, HTTPException
from pytrends.request import TrendReq

app = FastAPI()


class TrendSource(ABC):
    @abstractmethod
    def fetch(self, topic: str, limit: int) -> list[str]:
        pass


class GoogleTrendSource(TrendSource):
    def fetch(self, topic: str, limit: int) -> list[str]:
        pt = TrendReq(hl="en-US", tz=360)
        pt.build_payload([topic], timeframe="now 7-d")
        related = pt.related_queries()
        top = related.get(topic, {}).get("top")
        if top is None:
            return []
        return top["query"].head(limit).tolist()


source: TrendSource = GoogleTrendSource()


@app.get("/trends")
def get_trends(topic: str = Query(...), limit: int = Query(default=10, le=25)):
    try:
        keywords = source.fetch(topic, limit)
        return {"topic": topic, "keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
