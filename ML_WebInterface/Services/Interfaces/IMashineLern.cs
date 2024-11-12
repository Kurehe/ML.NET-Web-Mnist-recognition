using ML_WebInterface.Models;

namespace ML_WebInterface.Services.Interfaces
{
    public interface IMashineLern
    {
        void LoadMLModel(string modelName);
        OnnxRecognOutput GetPrediction(OnnxRecognInput Data);
    }
}
