"""User-approved background-only cutouts. Source RGB and source files stay intact."""
from pathlib import Path
import csv, json, hashlib
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CANON = Path('D:/OneDrive/444_비레스/00_최신본')
SOURCE = CANON / '04_장소_문장_이미지/generated_outputs'
OUT = ROOT / 'public/assets/explore'
# id, name, capital, source key, caption, classification, friendly source-grounded introduction
ROWS = [
('leonia','레오니아','라드아르할','radarhal','수도','왕국','왕실과 기사단의 전통이 이어지는 나라예요. 궁정에 물건을 납품하는 장인들의 솜씨도 함께 만나보세요.'),
('norghard','노르가르드','마르나브미르','marnabmir','수도','왕국','바다를 누비는 배와 철을 다루는 기술로 이름난 왕국이에요. 배를 만들고 고치는 항구에서 이 나라의 활기를 느껴보세요.'),
('tiris','티리스','라드바르할','radbarhal','수도','군주국','넓은 들에서 곡식을 기르고 양을 돌보는 나라예요. 숲과 물길을 따라 이어지는 사람들의 살림을 만나보세요.'),
('linrenet','린레네트','레눔가','renumga','중심도시','공화 도시국가','학문과 예술이 삶의 중심에 있는 공화국이에요. 기록원과 극장, 배움터에서 사람들이 나누는 이야기를 만나보세요.'),
('bekdoret','벡도레트','도르카르','dorkar','중심도시','군사 도시국가','튼튼한 성벽과 성문이 도시를 지키는 나라예요. 무기를 만들고 성벽을 돌보는 이들의 하루를 들여다보세요.'),
('senhalet','센할레트','센푸쿰','senpukum','중심도시','공동체 농업 국가','수로와 창고를 함께 돌보며 농사를 짓는 나라예요. 씨앗을 보관하고 먹을거리를 나누는 사람들을 만나보세요.'),
('hesferet','헤스페레트','헤스푸쿰','hespukum','중심도시','북방 복합 권역','추운 산과 광산, 초지가 이어지는 북쪽 땅이에요. 산길을 오가는 이들과 모피와 갑옷을 만드는 장인들의 삶을 둘러보세요.'),
('kelnabet','켈나베트','마르켈미르','markelmir','수도','항해·탐험 연방','먼 바다로 향하는 항해자와 탐험가들이 모이는 연방이에요. 자유로운 항구에서 새로운 바닷길의 이야기를 만나보세요.'),
('hesbeket','헤스베케트','베크헤스푸쿰','bekhespukum','수도','군주국','긴 겨울을 함께 견디며 살아가는 북쪽 나라예요. 따뜻한 옷과 오래 두는 먹을거리를 준비하는 사람들의 지혜를 만나보세요.'),
('yenmebet','옌메베트','옌워켈','yenwokel','수도','군주국','높은 산길과 숲을 삶의 터전으로 삼은 나라예요. 날씨를 살피며 길을 안내하고 숲을 돌보는 이들을 만나보세요.'),
('nimnaret','님나레트','얄베크움','yalbekum','수도','학술·연성 국가','쉽게 공개하지 않는 지식과 특별한 재료를 연구하는 나라예요. 조심스레 보관한 기록과 연구의 흔적을 살펴보세요.'),
('silnimet','실니메트','도르소르산','dorsorsan','중심도시','남방 복합 권역','산과 숲, 강과 초지가 어우러진 남쪽 땅이에요. 약초를 모으고 가축을 돌보며 강을 따라 오가는 사람들을 만나보세요.'),
('ardolet','아르도레트','도르소르할','dorsorhal','수도','산악 신정 왕국','높은 산에 수도원과 하늘을 살피는 관측대가 자리한 왕국이에요. 별의 움직임을 기록하고 약초를 모으는 일상을 만나보세요.'),
('garmebet','가르메베트','틱메브할','tikmebhal','중심거점','유목 부족 연합','계절에 따라 물과 풀을 찾아 이동하는 부족들의 연합이에요. 가축을 돌보고 물을 나누며 이어가는 삶을 만나보세요.'),
('silhalet','실할레트','실소르산','silsorsan','수도','숲 신정 군주국','소중히 지키는 숲과 왕실의 정원이 펼쳐진 나라예요. 나무와 약초를 돌보고 손으로 물건을 만드는 사람들을 만나보세요.'),
('merhalet','메르할레트','메르벨마르','merbelmar','수도','상업 공화국','강을 따라 항구와 장터가 이어지는 공화국이에요. 향과 직물, 진주를 싣고 오가는 배들을 따라 둘러보세요.'),
('nimsolet','님소레트','님할','nimhal','수도','학문·종교 군주국','배움과 신앙이 함께 뿌리내린 나라예요. 책을 읽고 서로의 생각을 나누는 학당과 모임을 만나보세요.'),
('sylvania','실바니아','실렌산','silensan','중심도시','주변 대륙권','안개 낀 숲과 늪에 오래된 기록이 남아 있는 대륙권이에요. 탐사자들이 모은 이야기와 숲의 전승을 따라가 보세요.'),
('dragonspire','드래곤스파이어','나르마르켈','narmarkel','중심거점','화산 군도권','먼 바다에 화산섬들이 이어진 곳이에요. 거친 바닷길을 건너온 항해 기록과 섬에 남은 이야기를 살펴보세요.'),
('fenrir-eye','펜리르의 눈','둔아르토르','dunartore','중심거점','외해 금기권','뱃사람들이 조심스레 이야기하는 먼 바다의 권역이에요. 사라진 등대와 난파선, 위험한 항로에 얽힌 기록을 만나보세요.'),
]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def cutout(path):
    rgb = np.array(Image.open(path).convert('RGB'))
    # Close small discontinuities in the bright metal silhouette, then retain the
    # external contour. Interior dark artwork is filled, never color-keyed out.
    bright = (rgb.max(axis=2) > 52).astype('uint8') * 255
    bright = cv2.morphologyEx(bright, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8))
    contours, _ = cv2.findContours(bright, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour = max(contours, key=cv2.contourArea)
    alpha = np.zeros(rgb.shape[:2], dtype=np.uint8)
    cv2.drawContours(alpha, [contour], -1, 255, cv2.FILLED)
    x,y,w,h = cv2.boundingRect(contour)
    result = np.dstack((rgb,alpha))[y:y+h,x:x+w]
    assert np.array_equal(result[:,:,:3], rgb[y:y+h,x:x+w])
    assert (result[:,:,3] == 0).any() and (result[:,:,3] == 255).any()
    return Image.fromarray(result), [x,y,w,h]

def main():
    for folder in ['crests','capitals']:
        (OUT/folder).mkdir(parents=True, exist_ok=True)
    coordinate_path = CANON/'02_지도/15_출판웹_선별라벨지도_v62/_data/ck5083-place-publish-label-placement-v62.csv'
    coordinates = list(csv.DictReader(coordinate_path.open(encoding='utf-8-sig')))
    countries, provenance = [], []
    sheet = Image.new('RGB',(1200,1200),'#09232f')
    draw = ImageDraw.Draw(sheet)
    for i,(slug,name,capital,key,capital_type,kind,copy) in enumerate(ROWS):
        matches = [p for p in coordinates if p['v62_output']=='vireth-ck5083-v62-full-boundaries-minimal-labels-12800.png' and p['권역명']==name and capital in p['장소명'].split(' / ')]
        assert len(matches)==1, (name,capital,len(matches))
        version = 'v3-dragon-crest' if slug=='leonia' else 'v2-no-runes' if slug=='hesferet' else 'v1'
        crest_source=SOURCE/f'heraldry/ck5083-heraldry-{slug}-imagegen-{version}-2048.png'
        city_source=SOURCE/f'city_vistas/ck5083-city-{slug}-{key}-imagegen-v1-2560-labeled.png'
        assert crest_source.exists() and city_source.exists(), (crest_source,city_source)
        crest,bbox = cutout(crest_source)
        crest_output=OUT/f'crests/{slug}.png'
        crest.save(crest_output)
        city_output=OUT/f'capitals/{slug}.webp'
        city=Image.open(city_source).convert('RGB')
        city.thumbnail((1280,720),Image.Resampling.LANCZOS)
        city.save(city_output,quality=90,method=6)
        row=matches[0]
        countries.append(dict(id=slug,name=name,capital=capital,capitalType=capital_type,kind=kind,isRegion=slug in ['hesferet','silnimet','sylvania','dragonspire','fenrir-eye'],x=int(row['render_pixel_x']),y=int(row['render_pixel_y']),copy=copy,crestWidth=crest.width,crestHeight=crest.height))
        provenance.append(dict(id=slug,crestSource=str(crest_source),crestSourceSHA256=digest(crest_source),crestOutput=str(crest_output.relative_to(ROOT/'public')),crestSHA256=digest(crest_output),crop=bbox,originalRGBPreserved=True,citySource=str(city_source),citySourceSHA256=digest(city_source),cityOutput=str(city_output.relative_to(ROOT/'public')),citySHA256=digest(city_output)))
        thumb=crest.copy();thumb.thumbnail((180,250),Image.Resampling.LANCZOS)
        left=(i%5)*240;top=(i//5)*300
        sheet.paste(thumb,(left+30,top+24),thumb)
        draw.text((left+16,top+278),slug,fill='#efdfbb')
    (ROOT/'src/countries.json').write_text(json.dumps(countries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (OUT/'all-country-provenance.json').write_text(json.dumps(dict(coordinateSource=str(coordinate_path),method='Original RGB; external silhouette alpha and tight crop. No generative redraw. Capitals are optimized display derivatives of active mapped images.',assets=provenance),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    sheet.save(ROOT/'country-cutouts-review.jpg',quality=95)
    print(f'Prepared {len(countries)} countries/regions; all source RGB preserved in cutouts.')

if __name__=='__main__':
    main()
