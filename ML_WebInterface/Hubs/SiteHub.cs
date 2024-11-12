using Microsoft.AspNetCore.SignalR;
using ML_WebInterface.Models;
using ML_WebInterface.Services.Interfaces;

namespace ML_WebInterface.Hubs
{
    public class SiteHub : Hub
    {
        private readonly IMashineLern mashine;
        string simpleModel = "mnist_dense2";
        string conv2DModel = "mnist_Conv2D";

        public SiteHub(IMashineLern mashine)
        {
            this.mashine = mashine;
        }

        public void GetPrediction_SimpleML(float[] DataPixels)
        {
            Console.WriteLine($"Simple ML, Data Length: {DataPixels.Length}, Model: {simpleModel}");

            float[] temp_res = GetPredictOn(DataPixels, simpleModel);
            PrintDataRecognition(temp_res);

            Clients.Caller.SendAsync("SimpleModel", temp_res);
        }

        public void GetPrediction2ConvML(float[] DataPixels)
        {
            Console.WriteLine($"Conv2D ML, Data Length: {DataPixels.Length}, Model: {conv2DModel}");

            float[] temp_res = GetPredictOn(DataPixels, conv2DModel);
            PrintDataRecognition(temp_res);

            Clients.Caller.SendAsync("Conv2DModel", temp_res);
        }

        /// <summary>
        /// Распознавание
        /// </summary>
        /// <param name="DataPixels">массив закрашенных пикселей</param>
        /// <param name="nameModel">Имя модели</param>
        /// <returns></returns>
        private float[] GetPredictOn(float[] DataPixels, string nameModel)
        {
            mashine.LoadMLModel(nameModel);
            OnnxRecognInput input = new OnnxRecognInput() { PixelValues = DataPixels };
            return mashine.GetPrediction(input).Score;
        }

        /// <summary>
        /// Печать лога в консоли 
        /// </summary>
        /// <param name="data"></param>
        private void PrintDataRecognition(float[] data)
        {
            float max = data[0];
            int index = 0;
            for (int i = 0; i < data.Length; i++)
            {
                if (data[i] > max)
                {
                    max = data[i];
                    index = i;
                }
            }
            Console.WriteLine($"распознания цифра: {index}, уверенность нс: {data[index]}");
        }

    }
}
