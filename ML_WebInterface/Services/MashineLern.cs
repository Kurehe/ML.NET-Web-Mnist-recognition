using Microsoft.ML;
using Microsoft.ML.Transforms.Onnx;
using ML_WebInterface.Models;
using ML_WebInterface.Services.Interfaces;

namespace ML_WebInterface.Services
{
    /// <summary>
    /// Нейросетевая магия распознования рукописных цифр
    /// </summary>
    public class MashineLern : IMashineLern
    {
        MLContext context = new MLContext();
        ITransformer predictModel;

        string baseDirectoryModels = @"../../../ONNX_Model";    // путь к папке с молелькам

        /// <summary>
        /// Загрузка модели из папки по её имени
        /// </summary>
        /// <param name="modelName">Имя модели в папке</param>
        /// <exception cref="NotImplementedException"></exception>
        public void LoadMLModel(string modelName)
        {
            string[] inputColums = new string[] { "28x28x1_input" };    // названия входных слоев
            string[] outputColums = new string[] { "OutPut10x1" };      // названия выходных слоев

            string temp_path = $"{baseDirectoryModels}/{modelName}.onnx";
            string path = GetAbsolutePath(temp_path);

            FileInfo file = new FileInfo(path);
            if (!file.Exists || file.Length == 0)
            {
                Console.WriteLine("Файл модели поврежден или имеет 0 размер!");
                throw new NotImplementedException();
            }

            OnnxScoringEstimator onnxPredictionPipeline = context.Transforms
                .ApplyOnnxModel(
                    outputColumnNames: outputColums,    // выходные столбцы
                    inputColumnNames: inputColums,      // входные столбцы
                    path);                              // путь до модели .onnx 

            // такую нелогичную хрень советую делать майки.
            IDataView emptyDv = context.Data.LoadFromEnumerable(new OnnxRecognInput[] { });
            predictModel = onnxPredictionPipeline.Fit(emptyDv); // типо это всё нужно для того что бы система понял с чем имеет дело
        }

        /// <summary>
        /// Получить результат распознования
        /// </summary>
        /// <param name="Data"></param>
        /// <returns></returns>
        public OnnxRecognOutput GetPrediction(OnnxRecognInput Data)
        {
            var onnxPredictionEngine = context.Model.CreatePredictionEngine<OnnxRecognInput, OnnxRecognOutput>(predictModel);
            OnnxRecognOutput prediction = onnxPredictionEngine.Predict(Data);   // распознование
            return prediction;
        }

        public static string GetAbsolutePath(string relativePath)
        {
            FileInfo _dataRoot = new FileInfo(typeof(Program).Assembly.Location);
            string assemblyFolderPath = _dataRoot.Directory.FullName;
            string fullPath = Path.Combine(assemblyFolderPath, relativePath);
            return fullPath;
        }
    }
}
