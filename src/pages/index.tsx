import { ExcaliburCanvas } from '@/components/ExcaliburCanvas';
import { RobotCanvas } from '@/components/KootaGridRobot';

export default function HomePage() {
  return (
    <div className="w-screen h-screen">
      {/* <ExcaliburCanvas /> */}
      <RobotCanvas />
    </div>
  );
}