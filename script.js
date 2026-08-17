const imageInput = document.getElementById("imageInput");
const readButton = document.getElementById("readButton");
const calculateButton = document.getElementById("calculateButton");

const ocrText = document.getElementById("ocrText");
const loading = document.getElementById("loading");
const result = document.getElementById("result");


/* =====================================
   READ IMAGE USING TESSERACT OCR
===================================== */

readButton.addEventListener("click", async () => {

    const image = imageInput.files[0];

    if (!image) {
        alert("Please select an image first.");
        return;
    }

    loading.innerText = "Reading image... Please wait.";

    ocrText.value = "";
    result.innerHTML = "";

    try {

        console.log("Starting OCR...");

        const { data: { text } } = await Tesseract.recognize(
            image,
            "eng",
            {
                logger: info => {

                    console.log(info);

                    if (info.status === "recognizing text") {
                        loading.innerText =
                            "Reading image... " +
                            Math.round(info.progress * 100) +
                            "%";
                    }
                }
            }
        );

        console.log("OCR RESULT:");
        console.log(text);

        ocrText.value = text.trim();

if (!text.trim() || !/\d/.test(text)) {
    loading.innerText = "Image read successfully!";

    alert(
        "No readable weight or price found.\n\n" +
        "Please upload an image containing weight and price."
    );

    return;
}

loading.innerText = "Image read successfully!";

    } catch (error) {

        console.error("OCR ERROR:", error);

        loading.innerText =
            "Could not read the image.";

        alert("Could not read the image. Check the browser console.");
    }
});


/* =====================================
   CALCULATE
===================================== */

calculateButton.addEventListener("click", () => {

    const text = ocrText.value.trim();

    if (!text) {

        alert("Please read an image first.");

        return;
    }

    console.log("TEXT TO PROCESS:");
    console.log(text);


    /* ---------------------------------
       FIND WEIGHT
    --------------------------------- */

    let weight = null;

    const weightMatch = text.match(
        /weight\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)?/i
    );

    if (weightMatch) {

        weight = parseFloat(weightMatch[1]);

    } else {

        /*
        If OCR does not recognize the word "weight",
        try to find a number followed by kg.
        */

        const kgMatch = text.match(
            /(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)\b/i
        );

        if (kgMatch) {
            weight = parseFloat(kgMatch[1]);
        }
    }


    /* ---------------------------------
       FIND PRICE
    --------------------------------- */

    let price = null;

    const priceMatch = text.match(
        /price\s*[:=]?\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)/i
    );

    if (priceMatch) {

        price = parseFloat(priceMatch[1]);

    } else {

        /*
        If OCR does not recognize "price",
        look for ₹ or Rs followed by a number.
        */

        const rupeeMatch = text.match(
            /(?:₹|rs\.?|rupees?)\s*(\d+(?:\.\d+)?)/i
        );

        if (rupeeMatch) {
            price = parseFloat(rupeeMatch[1]);
        }
    }


    console.log("Detected Weight:", weight);
    console.log("Detected Price:", price);


    /* ---------------------------------
       CHECK RESULT
    --------------------------------- */

    if (weight === null || price === null) {

        alert(
            "Could not find weight and price.\n\n" +
            "Detected text was:\n\n" +
            text +
            "\n\nExpected format:\n" +
            "weight: 2kg\n" +
            "price: 40"
        );

        return;
    }


    /* ---------------------------------
       CALCULATE TOTAL
    --------------------------------- */

    const total = weight * price;


    /* ---------------------------------
       DISPLAY RESULT
    --------------------------------- */

    result.innerHTML = `
        <div class="row">
            Weight:
            <b>${weight.toFixed(2)} kg</b>
        </div>

        <div class="row">
            Price:
            <b>₹${price.toFixed(2)} per kg</b>
        </div>

        <div class="row">
            Amount:
            <b>₹${total.toFixed(2)}</b>
        </div>

        <div class="total">
            TOTAL: ₹${total.toFixed(2)}
        </div>
    `;

});