const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

const download_image = (url, image_path) => {
    const dirName = "images";

    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);

    axios({ url, responseType: 'stream' }).then(response =>
		new Promise((resolve, reject) => {
			response.data
			.pipe(fs.createWriteStream("images/" + image_path))
			.on('finish', () => resolve())
			.on('error', e => reject(e))
	    }),
    );
}

const siteDir = 'https://b2b.paolo.ltd';

axios.get(`${siteDir}/%D0%9D%D0%B0%D1%87%D0%B0%D0%BB%D0%BE/1/2/40/null/`,{
    headers: { 'Cookie': 'PHPSESSID=9351c237052831ea98c0845877b7fa47' }
}).then(response => {
    const category = cheerio.load(response.data);
    const processedCodes = [];

    const products = category('.row').map(async (_, productRow) => {
        const product = category(productRow);
        const isAvailable = product.find('.count .cell4 .qty').length != 0;

        if(isAvailable) {
            const id = product.find('.count .cell2 .descirption').attr("dir");
            const title = product.find('.count .cell2 h5').text();
            let code = product.find('.count .cell2 strong').text().replace(/[^0-9\.]+/g, "") + "-P";
            const price = Math.ceil(product.find('.count .cell3').attr('data-price'));

            const additionalData = await axios.post(`${siteDir}/Functions/Requests/descirption.php`, `id=${id}`).then(response => {
                const additionalData = cheerio.load(response.data);
                const imagesUrls = additionalData('img').map((_, image) => image.attribs.src).toArray();
                const firstImage = imagesUrls[0];
    
                const repeated = processedCodes.find(x => x.code == code);
    
                if (repeated) repeated.repeats += 1;
                else processedCodes.push({ code: code, repeats: 0 });

                //Download first image

                const imageUrlParts = firstImage.split(".");
                const imageExtension = imageUrlParts[imageUrlParts.length-1];

                let imagePath = code;

                if(repeated) {
                    imagePath = `${imagePath}-${repeated.repeats}`;
                    code = `${code}-${repeated.repeats}`;
                }
                
                imagePath += `.${imageExtension}`;

                download_image(firstImage, imagePath);

                //Description data

                additionalData(".right h4").remove();

                let characteristics = additionalData(".right ul");
                characteristics.children().first().remove();
                
                characteristics = additionalData(".right ul:first");
                characteristics.before("<h4>Характеристики</h4>");

                let description  = additionalData(".right")
                    .contents()
                    .toArray()
                    .filter(x => x.name == 'ul' || x.name == 'p' || x.name == 'h4')
                    .map(x => cheerio.load(x).html())
                    .join("\n");
                    
                return {
                    descirption: description
                }
            })
    
            return {
                "Вид": "simple",
                "Код": code,
                "Име": title,
                "Публикувано": 1,
                "Подбран ли е?": 0,
                "Видимост в каталога": "visible",
                "Кратко описание": `${title}. Открийте най-качествените автоаксесоари в онлайн магазин CarsZona. Разгледайте нашата гама от предложения. Пазарувайте лесно и изгодно!`,
                "Описание": `${title}\n${additionalData.descirption}`,
                "Начална дата на намалението": "",
                "Крайна дата на намалението": "",
                "Състояние на таксата": "taxable",
                "Клас на такса": "",
                "В наличност?": "1",
                "Наличност": "",
                "Ниска наличност": "",
                "Разрешаване на поръчки при изчерпани наличности?": "0",
                "Индивидуално продаване?": "0",
                "Тегло (kg)": "",
                "Дължина (cm)": "",
                "Ширина (cm)": "",
                "Височина (cm)": "",
                "Да се позволи ли на потребителите да въвеждат отзиви?": "1",
                "Бележка при поръчка": "",
                "Промоционална цена:": "",
                "Редовна цена:": price,
                "Категории": "Екстериор, Екстериор > Автобагажници",
                "Етикети": "",
                "Клас на доставка": "",
                "Изображения": "https://carszona.com/wp-content/uploads/2022/05/carsz.jpg",
                "Лимит на изтеглянията": "",
                "Дни на валидност на възможността за изтегляне": "",
                "Родителски": "",
                "Групирани продукти": "",
                "По-скъпи": "",
                "Свързани": "",
                "Външен адрес": "",
                "Текст на бутон": "",
                "Позиция": "0",
                "Featured attributes": "a:3:{i:0;s:8:\"pa_phone\";i:1;s:8:\"pa_ekont\";i:2;s:9:\"pa_speedy\";}",
                "Име на атрибута 1": "Производител",
                "Стойност(и) на атрибута 1": "Universal",
                "Атрибутът 1 е видим": "1",
                "Глобален ли е атрибутът 1": "1",
                "Име на атрибута 2": "Телефон за поръчки",
                "Стойност(и) на атрибута 2": "088-595-6256",
                "Атрибутът 2 е видим": "1",
                "Глобален ли е атрибутът 2": "1",
                "Име на атрибута 3": "Доставка с Еконт",
                "Стойност(и) на атрибута 3": "Да",
                "Атрибутът 3 е видим": "1",
                "Глобален ли е атрибутът 3": "1",
                "Глобален ли е атрибутът 2": "1",
                "Име на атрибута 4": "Доставка със Спиди",
                "Стойност(и) на атрибута 4": "Да",
                "Атрибутът 4 е видим": "1",
                "Глобален ли е атрибутът 4": "1",
                "Мета: rank_math_internal_links_processed": "1",
                "Мета: inline_featured_image": "0",
                "Мета: _wp_page_template": "default",
                "Мета: _oembed_time_4bb1519c0d48216668f4635d642ba059": '1650192542',
                "Мета: _oembed_time_043af4273a985994ffee89f50281f2c0": '1650192558',
                "Мета: _oembed_time_35685db3bb5eeefe73cf191626b3d519": '1650192558',
                "Мета: _wp_old_date": '2021-01-07',
                "Мета: rank_math_seo_score": '63',
                "Мета: rank_math_primary_product_cat": '856',
                "Мета: rank_math_focus_keyword": title,
                "Мета: rank_math_description": `${title}. Открийте най-качествените автоаксесоари в онлайн магазин CarsZona. Разгледайте нашата гама от предложения. Пазарувайте лесно и изгодно!`
            }
        }

        return null;
    }).toArray();

    Promise.all(products).then(products => {
        products = products.filter(product => product != null);

        const csvFile = fs.createWriteStream("products.csv");
        const newCsvLine = (data) => csvFile.write(`\n${data}`);

        const headers = Object.keys(products[0]).join(",");
        newCsvLine(headers);
        
        products.forEach(product => {
            if(product != null)
                newCsvLine(Object.values(product).map(csvColumn => `"${csvColumn?.toString().replace(/\"/g, '""')}"`).join(","));
        })
        
        csvFile.end();    
    }).catch(e => console.log(e));
});
	