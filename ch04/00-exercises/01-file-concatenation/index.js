import * as fs from "node:fs";

function concatFiles(outputFile, inputFiles, callback) {
    outputFileExists(outputFile, (err) => {
        if (err) {
            return callback(err);
        }

        appendInputFiles(outputFile, inputFiles, (err) => {
            if (err) {
                return callback(err);
            }

            return callback();
        });
    });
}

function outputFileExists(outputFile, callback) {
    fs.access(outputFile, fs.constants.F_OK, (err) => {
        if (err?.code === "ENOENT") {
            return fs.writeFile(outputFile, "", (err) => {
                if (err) {
                    return callback(err);
                }

                return callback();
            });
        }

        if (err) {
            return callback(err);
        }

        return callback();
    });
}

function appendInputFiles(outputFile, inputFiles, callback) {
    function processFile(index) {
        if (index > inputFiles.length - 1) {
            return callback();
        }

        const file = inputFiles[index];

        fs.readFile(file, "utf8", (err, data) => {
            if (err) {
                return callback(err);
            }

            fs.appendFile(
                outputFile,
                data,
                { encoding: "utf8", flag: "a" },
                (err) => {
                    if (err) {
                        return callback(err);
                    }

                    index++;
                    processFile(index);
                },
            );
        });
    }

    processFile(0);
}

const [, , outputFile, ...inputFiles] = process.argv;

if (!outputFile) {
    console.error(`Malformatted argument. Should pass output file (destination file).
Usage: node index <output.txt> <input1.txt> <input2.txt> <input3.txt> <...>`);
    process.exit(1);
}

if (!inputFiles.length) {
    console.error(`Malformatted argument. At least one input file is required.
Usage: node index <output.txt> <input1.txt> <input2.txt> <input3.txt> <...>`);
    process.exit(1);
}

if (outputFile.includes("/")) {
    console.error(`Malformatted argument. Output file cannot be a folder.
Usage: node index <output.txt> <input1.txt> <input2.txt> <input3.txt> <...>`);
    process.exit(1);
}

concatFiles(outputFile, inputFiles, (err) => {
    if (err) {
        console.error(err);
    }

    console.log("Concatenation finished");
});
