# Přesné vymezení zadání

## Použivané pojmy
- inference = přesná část textu z popisu domény odkud například daný atribut/asociace vyplývá
	- pokud je přítomná informace o kardinalitě, tak součástí inference je i text pro určení kardinality daného atributu/asociace
- popis = text zahrnující veškeré okolí popisované věci (Př.: pro entitu souhrn všech jejích atributů a vztahů)
- definice = přesné vymezení daného pojmu zahrnující pouze některé věci z okolí (Př.: "student je osoba zapsaná do studijního programu vysoké školy", ale už součástí definice není například, že student má jméno, což by vyplývalo z jeho atributů)


## Cílový stav
- cílový stavem je vytvořit konceptuální model, kde každý atribut, asociace a každá entita má název a charakterizující text


## Všechny doteď zmiňované featury LLM asistenta

### 1. Navrhování atributů/asociací/entit
- pro každý atribut LLM navrhne:
	- název
	- datový typ
	- popis, pokud nemá na vstupu popis domény
	- inferenci, pokud má na vstupu popis domény
	- kardinalitu
	- (poznámka: každý atribut pak nějakým způsobem musí obsahovat i zdrojovou entitu, abychom věděli, ke které entitě patří)

<br />

- pro každou asociaci LLM navrhne:
	- název
	- právě jednu zdrojovou entitu
	- právě jednu cílovou entitu
		- poznámka: nebudeme pracovat s vícenásobnými asociacemi
	- popis, pokud nemá na vstupu popis domény
	- inferenci, pokud má na vstupu popis domény
	- kardinalitu

<br />

- pro každou entitu LLM navrhne:
	- název
	- popis, pokud nemá na vstupu popis domény
		- poznámka: popis si pak budeme moct nechat vytvořit nový pomocí 2. featury
	- inferenci, pokud má na vstupu popis domény
		- poznámka: tady ale nejspíš ta inference nebude přesně z popisu domény, ale bude to něco volněji odvozeného

<br />

- možná v některých situacích bude dávat smysl místo jednoho názvu atributu/asociace/entity navrhnout více názvů, proto uživateli můžeme dát možnost nastavit parametr pro počet názvů
	- nebo pokud se uživateli nebude líbit ten aktuální název atributu/asociace/entity, tak si bude moct nechat vygenerovat jiné názvy
	- podobně uživatele necháme nastavit i kolik atributů/asociací chce navrhnout, když není zadán popis domény

<br />
<br />

- když uživatel ve svém konceptuálním modelu:
	- a) nic neoznačí
		- LLM umí navrhnout entity čistě na základě popisu domény

	- b) označí jednu entitu
		- LLM umí pro ni navrhnout atributy, nebo asociace bez popisu domény
		- LLM umí pro ni navrhnout atributy, nebo asociace čistě na základě popisu domény

	- c) označí dvě entity
		- LLM umí pro ně navrhnout asociace bez popisu domény
		- LLM umí pro ně navrhnout asociace čistě na základě popisu domény

	- d) označí část popisu domény
		- LLM umí v této vyznačené části najít atributy/asociace/entity
		- případně lze omezit, jak moc velkou část popisu domény uživatel může označit

	- e) nic neoznačí, ale zadá instrukci do odděleného textového pole od popisu domény
		- Př.: Studenti pracují na diplomkách
		- LLM umí navrhnout takový seznam atributů, asociací a entit, které čistě na základě popisu domény povedou k vykonání požadované instrukce
		- pokud to pomůže, tak nejdřív uživatel bude muset označit entitu, pro kterou chce provést příslušnou instrukci
        - jak by to mohlo být uskutečněno:
            - v prvním kroce LLM se pokusí najít zdrojovou entitu pro tuto instrukci (Př.: "můžeme pokračovat, protože už studenta máme namodelovaného")
            - druhý krok: identifikuj entity, které ještě nemáme namodelované (Př.: LLM asistent se uživatele zeptá, jestli chce přidat entitu "diplomka")
            - další kroky: LLM zkusí pro nalezenou zdrojovou entitu najít atributy jako v b) a potom mezi nalezenými entitami může zkusit najít asociace jako v c)

	- f) nic neoznačí, ale zvolí možnost autopilota
		- LLM navrhne konceptuální model pro zadaný popis domény bez uživatelovy pomoci

<br />
<br />

#### Frontend
- každý návrh atributu/asociace/entity lze:
	- I) přidat do uživatelova konceptuálního modelu (pokud je návrh složitější, tak provést sloučení s již existujícím uživatelovým konceptuálním modelem)
	- II) upravit (lze změnit každou navrhovanou část)
	- III) v expertním režimu označit za relevantní pro případný fine-tuning LLM

- jakým způsobem navrhovat atributy/asociace/entity:
	- a) sidebar, ve kterém zobrazíme všechny návrhy
	- b) sidebar, ale když bude návrh obsahovat inferenci, tak v popisu domény zvýrazníme odpovídající část textu, na kterou když najedeme myší, tak se zobrazí příslušný návrh
		- Př.: entity vždy budeme ukazovat mimo ten popis domény, protože nikdy nebudou mít inferenci
		- potom bude otázka, jestli nepřidat nějakou možnost filtrování těch označených částí (Př.: možnost nechat ukázat zvýrazněné části pouze pro návrhy atributů), abychom nezahlcovali uživatele hodně různými návrhy

- pokud LLM bude umět generovat složitější návrhy (= návrhy obsahující více než právě jeden atribut, nebo právě jednu asociaci, nebo právě jednu entitu), tak jakým způsobem je zobrazit:
	- I) jako pro jednoduchý návrh, jenom v nějakém boxu pod sebou bude vyjmenováno více věcí, kde ten box bude vyznačovat, co patří k jednomu příslušnému návrhu
	- II) konceptuální model zachycující změny
	- nechat si uživatele vybrat z I) a II), která varianta mu nejvíc vyhovuje

<br />
<br />

### 2. Textový popis

- předpoklad: uživatel označí část konceptuálního modelu

- a) LLM umí vytvořit popisek ke každému atributu/asociaci
	- každý popisek nejdřív uživatel bude muset potvrdit, že je v pořádku
		- jinak bude mít možnost popisek buď odebrat, nebo zeditovat
	- I) LLM nebude mít na vstupu popis domény
	- II) LLM bude mít na vstupu popis domény

- b) LLM umí provést nestrukturované shrnutí
	- pokud je používán popis domény, tak ve výchozím nastavení je výstup v míře detailů odpovídající popisu domény
	- pokud není používán popis domény, tak výstup bude podle nějakého výchozího nastavení

- pro libovolný automaticky generovaný text možnost nechat uživatele nastavit některé parametry:
	- I) formalita: neformální, neutrální, formální
	- II) doména: akademická, obecná, casual, atd.


<br />
<br />

### 3. Zvýraznění již namodelované části v popisu domény

- když uživatel označí část konceptuálního modelu:
	- a) tak atributy/asociace, které mají inferenci, jsou zvýrazněny v popisu domény
	- b) ostatní části jsou poslány LLM s popisem domény pro pokus o zisk inference
		- pokud v popisu domény nejsou, tak uživatel bude mít možnost si nechat tu část popisu domény vygenerovat přes featuru 2b)

<br />
<br />

#### Frontend
- možnost zapnout automatické zvýrazňování v popisu domény všech atributů a asociací:
	- I) které mají inferenci
	- II) které mají inferenci a zároveň je má uživatel označené

- když myší najedeme na libovolnou zvýrazněnou část, tak ukázat tooltip obsahující název entity a název příslušného atributu/asociace

<br />
<br />

## Ostatní věci

Jaký typ vstupu budeme zvládat:
- a) uživatel ručně vloží text do nějakého předem daného textového pole
- b) + navíc možnost nahrát do textového pole obsah obyčejného textového souboru
- c) + navíc možnost nahrát do textového pole obsah souboru ve formátu PDF (případně v jiném formátu)

<br />
<br />

Jaký formát popisu domény bude zvládat:
- a) text ve větách
- b) seznam bodů (Př.: školní řád)
- c) obrázky, nebo jiné formáty?

<br />
<br />

Jak reagovat na editování popisu domény:
- a) nijak
- b) zkusit automaticky aktualizovat inference (ale to by mohlo trvat dlouho)
- c) možná zkontrolovat, jestli ten popis domény není víceznačný, nebo jestli si některé části neprotiřečí
- d) zkusit detekovat části textu, které nepopisují tu doménu
- e) nějaký jiný způsob?