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

axios.get(`${siteDir}/%D0%9D%D0%B0%D1%87%D0%B0%D0%BB%D0%BE/4/134/128/null/`,{
    headers: { 'Cookie': 'PHPSESSID=d7cb496b0a04c965b964564f6d388f3b' }
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
                characteristics.before("<h4>????????????????????????????</h4>");

                let description  = additionalData(".right")
                    .contents()
                    .toArray()
                    .filter(x => x.name == 'ul' || x.name == 'ol' || x.name == 'span' || x.name == 'p' || x.name == 'h4' || x.name == 'table')
                    .map(x => cheerio.load(x).html())
                    .join("\n");
                    
                return {
                    descirption: description
                }
            })
    
            return {
                "??????": "simple",
                "??????": code,
                "??????": title,
                "??????????????????????": 1,
                "?????????????? ???? ???": 0,
                "???????????????? ?? ????????????????": "visible",
                "???????????? ????????????????": `${title}. ???????????????? ??????-???????????????????????? ?????????????????????????? ?? ???????????? ?????????????? CarsZona. ?????????????????????? ???????????? ???????? ???? ??????????????????????. ?????????????????????? ?????????? ?? ??????????????!`,
                "????????????????": `${title}\n${additionalData.descirption}`,
                "?????????????? ???????? ???? ??????????????????????": "",
                "???????????? ???????? ???? ??????????????????????": "",
                "?????????????????? ???? ??????????????": "taxable",
                "???????? ???? ??????????": "",
                "?? ???????????????????": "1",
                "??????????????????": "",
                "?????????? ??????????????????": "",
                "?????????????????????? ???? ?????????????? ?????? ?????????????????? ?????????????????????": "0",
                "???????????????????????? ???????????????????": "0",
                "?????????? (kg)": "",
                "?????????????? (cm)": "",
                "???????????? (cm)": "",
                "???????????????? (cm)": "",
                "???? ???? ?????????????? ???? ???? ?????????????????????????? ???? ???????????????? ?????????????": "1",
                "?????????????? ?????? ??????????????": "",
                "?????????????????????????? ????????:": "",
                "?????????????? ????????:": price,
                "??????????????????": "?????????????????? ???? ????????????, ?????????????????? ???? ???????????? > ??????????????",
                "??????????????": "",
                "???????? ???? ????????????????": "",
                "??????????????????????": "https://carszona.com/wp-content/uploads/2022/05/carsz.jpg",
                "?????????? ???? ????????????????????????": "",
                "?????? ???? ?????????????????? ???? ???????????????????????? ???? ??????????????????": "",
                "????????????????????": "",
                "?????????????????? ????????????????": "",
                "????-??????????": "",
                "????????????????": "",
                "???????????? ??????????": "",
                "?????????? ???? ??????????": "",
                "??????????????": "0",
                "Featured attributes": "a:3:{i:0;s:8:\"pa_phone\";i:1;s:8:\"pa_ekont\";i:2;s:9:\"pa_speedy\";}",
                "?????? ???? ???????????????? 1": "????????????????????????",
                "????????????????(??) ???? ???????????????? 1": "Universal",
                "?????????????????? 1 ?? ??????????": "1",
                "???????????????? ???? ?? ?????????????????? 1": "1",
                "?????? ???? ???????????????? 2": "?????????????? ???? ??????????????",
                "????????????????(??) ???? ???????????????? 2": "088-595-6256",
                "?????????????????? 2 ?? ??????????": "1",
                "???????????????? ???? ?? ?????????????????? 2": "1",
                "?????? ???? ???????????????? 3": "???????????????? ?? ??????????",
                "????????????????(??) ???? ???????????????? 3": "????",
                "?????????????????? 3 ?? ??????????": "1",
                "???????????????? ???? ?? ?????????????????? 3": "1",
                "???????????????? ???? ?? ?????????????????? 2": "1",
                "?????? ???? ???????????????? 4": "???????????????? ?????? ??????????",
                "????????????????(??) ???? ???????????????? 4": "????",
                "?????????????????? 4 ?? ??????????": "1",
                "???????????????? ???? ?? ?????????????????? 4": "1",
                "????????: rank_math_internal_links_processed": "1",
                "????????: inline_featured_image": "0",
                "????????: _wp_page_template": "default",
                "????????: _oembed_time_4bb1519c0d48216668f4635d642ba059": '1650192542',
                "????????: _oembed_time_043af4273a985994ffee89f50281f2c0": '1650192558',
                "????????: _oembed_time_35685db3bb5eeefe73cf191626b3d519": '1650192558',
                "????????: _wp_old_date": '2021-01-07',
                "????????: rank_math_seo_score": '63',
                "????????: rank_math_primary_product_cat": '1102',
                "????????: rank_math_focus_keyword": title,
                "????????: rank_math_description": `${title}. ???????????????? ??????-???????????????????????? ?????????????????????????? ?? ???????????? ?????????????? CarsZona. ?????????????????????? ???????????? ???????? ???? ??????????????????????. ?????????????????????? ?????????? ?? ??????????????!`
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
    });
});
	